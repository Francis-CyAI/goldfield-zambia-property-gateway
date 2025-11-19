import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger, setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { config } from "./config.js";
import "./firebaseApp.js";
import {
  acceptPayment,
  getCollectionById,
  getCollectionStatusByReference,
  getPaymentStatus,
  initiateMobileMoneyCollection,
  MobileMoneyNetwork,
  MobileMoneyOperator,
} from "./lencoClient.js";
import { db, serverTimestamp } from "./firestore.js";
import { getMessaging } from "firebase-admin/messaging";
setGlobalOptions({
  region: "africa-south1",
  memory: "256MiB",
  enforceAppCheck: false,
});

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  propertyType?: string;
  location?: string;
  message?: string;
};

type SubscriptionCheckoutPayload = {
  userId: string;
  subscriptionTierId: string;
  subscriptionTierName: string;
  amount: number;
  currency?: string;
  mobileMoneyNetwork: MobileMoneyNetwork;
  msisdn: string;
};

type PartnerCheckoutPayload = {
  userId: string;
  partnerName: string;
  businessType: string;
  subscriptionTier: string;
  amount: number;
  currency?: string;
  mobileMoneyNetwork: MobileMoneyNetwork;
  msisdn: string;
};

type BookingPaymentPayload = {
  bookingId: string;
  amount: number;
  msisdn: string;
  operator: string;
  country?: string;
  bearer?: "merchant" | "customer";
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

type BookingPaymentStatusPayload = {
  reference?: string;
  bookingId?: string;
  forceCheck?: boolean;
};

const BOOKING_PAYMENTS_COLLECTION = "booking_payments";
const NOTIFICATION_TOKENS_COLLECTION = "notification_tokens";
const messaging = getMessaging();

const validateNetwork = (network: string): MobileMoneyNetwork => {
  const upper = network.toUpperCase();
  if (upper !== "AIRTEL" && upper !== "MTN" && upper !== "ZAMTEL") {
    throw new HttpsError("invalid-argument", "Unsupported mobile money network");
  }
  return upper as MobileMoneyNetwork;
};

const maskPhone = (value: string) => value.replace(/.(?=.{4})/g, "*");

const normalizeOperator = (value: string): MobileMoneyOperator => {
  const lower = value.toLowerCase();
  if (lower !== "airtel" && lower !== "mtn" && lower !== "zamtel") {
    throw new HttpsError("invalid-argument", "Unsupported mobile money operator");
  }
  return lower as MobileMoneyOperator;
};

const resolveBookingPaymentDoc = async (payload: BookingPaymentStatusPayload) => {
  if (payload.reference) {
    const doc = await db.collection(BOOKING_PAYMENTS_COLLECTION).doc(payload.reference).get();
    if (doc.exists) {
      return doc;
    }
  }

  if (payload.bookingId) {
    const snapshot = await db
      .collection(BOOKING_PAYMENTS_COLLECTION)
      .where("booking_id", "==", payload.bookingId)
      .orderBy("initiated_at", "desc")
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0];
    }
  }

  throw new HttpsError("not-found", "Booking payment not found.");
};

const computeExpiry = (initiatedAt?: Timestamp | null) => {
  const base =
    initiatedAt instanceof Timestamp ? initiatedAt : Timestamp.fromMillis(Date.now());

  return Timestamp.fromMillis(base.toMillis() + config.lenco.collectionStatusCheckDurationMs);
};

export const sendContactEmail = onCall<ContactPayload>(async (request) => {
  const { data } = request;
  if (!data?.name || !data?.email || !data?.message) {
    throw new HttpsError("invalid-argument", "Missing required contact fields.");
  }

  const docRef = db.collection("contact_messages").doc();
  await docRef.set({
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    service: data.service ?? null,
    property_type: data.propertyType ?? null,
    location: data.location ?? null,
    message: data.message,
    status: "open",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  await db.collection("notification_queue").add({
    type: "contact",
    contact_id: docRef.id,
    to: config.notifications.contactRecipient,
    payload: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      service: data.service,
      propertyType: data.propertyType,
      location: data.location,
    },
    created_at: serverTimestamp(),
    processed: false,
  });

  logger.info("Contact message stored", {
    contactId: docRef.id,
    email: data.email,
  });

  return {
    success: true,
    contactId: docRef.id,
  };
});

export const saveUserMessagingToken = onCall<{ token?: string; platform?: string }>(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const token = request.data?.token;
  if (!token || typeof token !== "string") {
    throw new HttpsError("invalid-argument", "Missing device token.");
  }

  const platform = request.data?.platform ?? "web";
  const userAgent = request.rawRequest.headers["user-agent"] ?? null;

  await db.collection(NOTIFICATION_TOKENS_COLLECTION).doc(token).set(
    {
      user_id: request.auth.uid,
      token,
      platform,
      user_agent: userAgent,
      last_seen_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      created_at: serverTimestamp(),
    },
    { merge: true },
  );

  logger.info("Saved notification token", { uid: request.auth.uid, platform });
  return { success: true };
});

export const sendPushForNotification = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const notification = snapshot.data() as any;
  const userId = notification.user_id;
  if (!userId) {
    return;
  }

  const tokensSnapshot = await db
    .collection(NOTIFICATION_TOKENS_COLLECTION)
    .where("user_id", "==", userId)
    .get();

  if (tokensSnapshot.empty) {
    logger.info("No notification tokens for user", { userId });
    return;
  }

  const tokens = tokensSnapshot.docs.map((docSnap) => docSnap.id || docSnap.get("token")).filter(Boolean) as string[];
  if (tokens.length === 0) {
    logger.info("No valid tokens for user", { userId });
    return;
  }

  const message = {
    tokens,
    notification: {
      title: notification.title ?? "New notification",
      body: notification.message ?? "",
    },
    data: {
      notificationId: snapshot.id,
      type: notification.type ?? "info",
      relatedId: notification.related_id ?? "",
    },
  };

  const response = await messaging.sendEachForMulticast(message);
  response.responses.forEach((res, index) => {
    if (!res.success) {
      const errorCode = res.error?.code;
      if (errorCode === "messaging/registration-token-not-registered" || errorCode === "messaging/invalid-registration-token") {
        const badToken = tokens[index];
        db.collection(NOTIFICATION_TOKENS_COLLECTION).doc(badToken).delete().catch(() => {});
      }
      logger.warn("Failed to deliver push notification", {
        tokenIndex: index,
        error: res.error?.message,
      });
    }
  });
});

const createPaymentIntent = async (
  payload: Omit<SubscriptionCheckoutPayload, "subscriptionTierName"> & {
    kind: "user" | "partner";
    subscriptionTierName?: string;
    partnerName?: string;
  },
) => {
  const network = validateNetwork(payload.mobileMoneyNetwork);
  const currency = payload.currency ?? "ZMW";
  const narration =
    payload.kind === "partner"
      ? `Partner subscription (${payload.partnerName ?? "Partner"})`
      : `Subscription tier ${payload.subscriptionTierName ?? payload.subscriptionTierId}`;

  const result = await acceptPayment({
    amount: payload.amount,
    currency,
    customerName:
      payload.kind === "partner"
        ? payload.partnerName ?? "Partner"
        : payload.subscriptionTierName ?? "Subscriber",
    customerPhone: payload.msisdn,
    narration,
    metadata: {
      userId: payload.userId,
      subscriptionTierId: payload.subscriptionTierId,
      kind: payload.kind,
    },
    network,
  });

  const collection =
    payload.kind === "partner" ? "partner_payments" : "subscription_payments";

  const docRef = db.collection(collection).doc(result.reference);
  await docRef.set({
    user_id: payload.userId,
    subscription_tier_id: payload.subscriptionTierId,
    subscription_tier_name: payload.subscriptionTierName ?? null,
    amount: payload.amount,
    currency,
    network,
    msisdn: payload.msisdn,
    payment_id: result.id,
    reference: result.reference,
    status: result.status,
    customer_id: result.customerId ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    kind: payload.kind,
  });

  return {
    payment: result,
    intentRef: docRef,
  };
};

export const initiateBookingMobileMoneyPayment = onCall<BookingPaymentPayload>(async (request) => {
  const data = request.data ?? {};
  if (!data.bookingId || typeof data.bookingId !== "string") {
    throw new HttpsError("invalid-argument", "bookingId is required.");
  }
  if (typeof data.amount !== "number" || data.amount <= 0) {
    throw new HttpsError("invalid-argument", "amount must be a positive number.");
  }
  if (!data.msisdn || typeof data.msisdn !== "string") {
    throw new HttpsError("invalid-argument", "msisdn is required.");
  }
  if (!data.operator || typeof data.operator !== "string") {
    throw new HttpsError("invalid-argument", "operator is required.");
  }

  const operator = normalizeOperator(data.operator);
  const reference =
    data.reference?.trim().length && data.reference.length >= 3
      ? data.reference.trim()
      : `booking_${data.bookingId}_${Date.now()}`;

  try {
    const initiatedAt = Timestamp.now();
    const expiresAt = computeExpiry(initiatedAt);

    const collection = await initiateMobileMoneyCollection({
      amount: data.amount,
      reference,
      phone: data.msisdn,
      operator,
      country: data.country ?? "zm",
      bearer: data.bearer ?? "merchant",
    });

    const docRef = db.collection(BOOKING_PAYMENTS_COLLECTION).doc(reference);
    await docRef.set({
      booking_id: data.bookingId,
      amount: data.amount,
      currency: data.currency ?? collection.currency ?? "ZMW",
      country: (data.country ?? "zm").toLowerCase(),
      bearer: data.bearer ?? "merchant",
      operator,
      msisdn: data.msisdn,
      msisdn_masked: maskPhone(data.msisdn),
      metadata: data.metadata ?? {},
      reference,
      lenco_collection_id: collection.id,
      lenco_reference: collection.lencoReference,
      status: collection.status,
      last_known_status: collection.status,
      initiated_at: initiatedAt,
      expires_at: expiresAt,
      check_window_ms: config.lenco.collectionStatusCheckDurationMs,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_status_synced_at: serverTimestamp(),
    });

    logger.info("Booking payment initiated", {
      bookingId: data.bookingId,
      reference,
      operator,
      amount: data.amount,
    });

    return {
      success: true,
      reference,
      lencoCollectionId: collection.id,
      lencoReference: collection.lencoReference,
      status: collection.status,
      amount: collection.amount,
      currency: collection.currency,
      initiatedAt: initiatedAt.toDate().toISOString(),
      expiresAt: expiresAt.toDate().toISOString(),
      checkWindowMs: config.lenco.collectionStatusCheckDurationMs,
    };
  } catch (error) {
    logger.error("Failed to initiate booking payment", {
      bookingId: data.bookingId,
      reference,
      error,
    });
    throw new HttpsError("internal", "Failed to initiate mobile money payment.");
  }
});

export const checkBookingMobileMoneyPaymentStatus = onCall<BookingPaymentStatusPayload>(
  async (request) => {
    const payload = request.data ?? {};
    if (!payload.reference && !payload.bookingId) {
      throw new HttpsError("invalid-argument", "Provide reference or bookingId.");
    }

    const doc = await resolveBookingPaymentDoc(payload);
    const record = doc.data() ?? {};
    const reference = record.reference ?? doc.id;
    const forceCheck = payload.forceCheck === true;
    const initiatedAt =
      record.initiated_at instanceof Timestamp ? (record.initiated_at as Timestamp) : null;

    const expiresAt =
      record.expires_at instanceof Timestamp
        ? (record.expires_at as Timestamp)
        : computeExpiry(initiatedAt);

    const now = Timestamp.now();
    const inCheckWindow = expiresAt ? now.toMillis() <= expiresAt.toMillis() : true;

    if (!inCheckWindow && !forceCheck) {
      return {
        success: true,
        reference,
        status: record.last_known_status ?? record.status ?? "pending",
        inCheckWindow: false,
        requiresManualConfirmation: true,
        expiresAt: expiresAt.toDate().toISOString(),
        checkWindowMs: config.lenco.collectionStatusCheckDurationMs,
        amount: record.amount,
        currency: record.currency ?? "ZMW",
      };
    }

    try {
      let status;
      if (reference) {
        status = await getCollectionStatusByReference(reference);
      } else if (record.lenco_collection_id) {
        status = await getCollectionById(record.lenco_collection_id);
      } else {
        throw new Error("Unable to determine Lenco reference for booking payment.");
      }

      await doc.ref.set(
        {
          status: status.status,
          last_known_status: status.status,
          lenco_reference: status.lencoReference,
          completed_at: status.completedAt ?? null,
          updated_at: serverTimestamp(),
          last_status_synced_at: serverTimestamp(),
        },
        { merge: true },
      );

      logger.info("Booking payment checked", {
        reference,
        status: status.status,
        manualCheck: forceCheck && !inCheckWindow,
      });

      return {
        success: true,
        reference,
        status: status.status,
        amount: status.amount,
        currency: status.currency,
        inCheckWindow,
        manualCheck: forceCheck && !inCheckWindow,
        expiresAt: expiresAt.toDate().toISOString(),
        initiatedAt: status.initiatedAt ?? initiatedAt?.toDate().toISOString() ?? null,
        completedAt: status.completedAt ?? null,
        checkWindowMs: config.lenco.collectionStatusCheckDurationMs,
        lencoCollectionId: status.id,
        lencoReference: status.lencoReference,
      };
    } catch (error) {
      logger.error("Failed to check booking payment status", {
        reference,
        error,
      });
      throw new HttpsError("internal", "Failed to verify booking payment.");
    }
  },
);

export const createSubscriptionCheckout = onCall<SubscriptionCheckoutPayload>(async (request) => {
  const data = request.data;
  if (
    !data?.userId ||
    !data.subscriptionTierId ||
    !data.subscriptionTierName ||
    !data.amount ||
    !data.msisdn ||
    !data.mobileMoneyNetwork
  ) {
    throw new HttpsError("invalid-argument", "Missing required subscription checkout fields.");
  }

  const { payment, intentRef } = await createPaymentIntent({
    ...data,
    kind: "user",
  });

  const subscriptionRef = db.collection("user_subscriptions").doc(data.userId);
  await subscriptionRef.set(
    {
      id: data.userId,
      user_id: data.userId,
      subscription_tier_id: data.subscriptionTierId,
      subscription_tier_name: data.subscriptionTierName,
      status: payment.status === "SUCCESS" ? "active" : "pending",
      lenco_payment_reference: payment.reference,
      lenco_payment_id: payment.id,
      lenco_customer_id: payment.customerId ?? null,
      last_payment_status: payment.status,
      last_payment_at: FieldValue.serverTimestamp(),
      next_billing_at: null,
      mobile_money_network: data.mobileMoneyNetwork,
      mobile_money_number_masked: maskPhone(data.msisdn),
      updated_at: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  logger.info("Subscription checkout initiated", {
    userId: data.userId,
    tier: data.subscriptionTierId,
    paymentReference: payment.reference,
    maskedPhone: maskPhone(data.msisdn),
  });

  return {
    success: true,
    paymentReference: payment.reference,
    paymentId: payment.id,
    status: payment.status,
    customerId: payment.customerId ?? null,
    intentPath: intentRef.path,
  };
});

export const createPartnerCheckout = onCall<PartnerCheckoutPayload>(async (request) => {
  const data = request.data;
  if (
    !data?.userId ||
    !data.partnerName ||
    !data.subscriptionTier ||
    !data.amount ||
    !data.msisdn ||
    !data.mobileMoneyNetwork
  ) {
    throw new HttpsError("invalid-argument", "Missing required partner checkout fields.");
  }

  const { payment, intentRef } = await createPaymentIntent({
    ...data,
    subscriptionTierId: data.subscriptionTier,
    kind: "partner",
  });

  const partnerRef = db.collection("partner_subscriptions").doc(data.userId);
  await partnerRef.set(
    {
      id: data.userId,
      user_id: data.userId,
      partner_name: data.partnerName,
      subscription_tier: data.subscriptionTier,
      business_type: data.businessType,
      monthly_fee: data.amount,
      status: payment.status === "SUCCESS" ? "active" : "pending",
      lenco_payment_reference: payment.reference,
      lenco_payment_id: payment.id,
      lenco_customer_id: payment.customerId ?? null,
      last_payment_status: payment.status,
      current_period_start: FieldValue.serverTimestamp(),
      current_period_end: null,
      mobile_money_network: data.mobileMoneyNetwork,
      mobile_money_number_masked: maskPhone(data.msisdn),
      updated_at: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  logger.info("Partner checkout initiated", {
    userId: data.userId,
    tier: data.subscriptionTier,
    paymentReference: payment.reference,
    maskedPhone: maskPhone(data.msisdn),
  });

  return {
    success: true,
    paymentReference: payment.reference,
    paymentId: payment.id,
    status: payment.status,
    customerId: payment.customerId ?? null,
    intentPath: intentRef.path,
  };
});

export const checkPartnerSubscription = onCall(async (request) => {
  const { userId } = request.data ?? {};
  if (!userId) {
    throw new HttpsError("invalid-argument", "userId is required.");
  }

  const partnerRef = db.collection("partner_subscriptions").doc(userId);
  const snapshot = await partnerRef.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Partner subscription not found.");
  }

  const data = snapshot.data() ?? {};
  if (!data.lenco_payment_reference && !data.lenco_payment_id) {
    return { subscription: data };
  }

  const status = await getPaymentStatus({
    id: data.lenco_payment_id,
    reference: data.lenco_payment_reference,
  });

  const updates = {
    last_payment_status: status.status,
    updated_at: FieldValue.serverTimestamp(),
  } as Record<string, unknown>;

  if (status.status === "SUCCESS") {
    updates.status = "active";
    updates.current_period_start = FieldValue.serverTimestamp();
  } else if (status.status === "FAILED" || status.status === "CANCELLED") {
    updates.status = "past_due";
  }

  await partnerRef.set(updates, { merge: true });

  logger.info("Partner subscription reconciled", {
    userId,
    status: status.status,
    reference: status.reference,
  });

  return {
    subscription: { ...data, ...updates },
    paymentStatus: status,
  };
});

export const reconcileLencoPayments = onSchedule("every 15 minutes", async () => {
  const collections = [
    { name: "subscription_payments", target: "user_subscriptions", userField: "user_id" },
    { name: "partner_payments", target: "partner_subscriptions", userField: "user_id" },
  ];

  for (const collection of collections) {
    const pendingSnapshot = await db
      .collection(collection.name)
      .where("status", "==", "PENDING")
      .limit(25)
      .get();

    if (pendingSnapshot.empty) {
      continue;
    }

    for (const doc of pendingSnapshot.docs) {
      const payment = doc.data();
      try {
        const status = await getPaymentStatus({
          id: payment.payment_id,
          reference: payment.reference,
        });

        await doc.ref.set(
          {
            status: status.status,
            last_synced_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true },
        );

        const targetRef = db.collection(collection.target).doc(payment[collection.userField]);
        const targetUpdates: Record<string, unknown> = {
          last_payment_status: status.status,
          updated_at: FieldValue.serverTimestamp(),
        };

        if (collection.target === "user_subscriptions") {
          if (status.status === "SUCCESS") {
            targetUpdates.status = "active";
            targetUpdates.current_period_start = FieldValue.serverTimestamp();
          } else if (status.status === "FAILED" || status.status === "CANCELLED") {
            targetUpdates.status = "past_due";
          }
        } else if (collection.target === "partner_subscriptions") {
          if (status.status === "SUCCESS") {
            targetUpdates.status = "active";
            targetUpdates.current_period_start = FieldValue.serverTimestamp();
          } else if (status.status === "FAILED" || status.status === "CANCELLED") {
            targetUpdates.status = "past_due";
          }
        }

        await targetRef.set(targetUpdates, { merge: true });

        logger.info("Payment reconciled", {
          collection: collection.name,
          paymentReference: payment.reference,
          userId: payment[collection.userField],
          status: status.status,
        });
      } catch (error) {
        logger.error("Failed to reconcile payment", {
          collection: collection.name,
          paymentReference: payment.reference,
          error,
        });
      }
    }
  }
});

export const processCommissionPayouts = onSchedule("every 24 hours", async () => {
  const commissionsSnapshot = await db
    .collection("platform_commissions")
    .where("status", "==", "pending")
    .limit(20)
    .get();

  if (commissionsSnapshot.empty) {
    return;
  }

  for (const doc of commissionsSnapshot.docs) {
    const commission = doc.data();
    logger.info("Queueing commission for payout", {
      commissionId: doc.id,
      bookingId: commission.booking_id,
    });

    await doc.ref.set(
      {
        status: "processing",
        payout_enqueued_at: serverTimestamp(),
      },
      { merge: true },
    );
  }
});
