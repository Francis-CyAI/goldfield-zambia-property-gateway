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
  initiateMobileMoneyPayout,
  getPayoutStatusByReference,
  MobileMoneyNetwork,
  MobileMoneyOperator,
} from "./lencoClient.js";
import { db, serverTimestamp } from "./firestore.js";
import { getMessaging } from "firebase-admin/messaging";
import { calculateLencoFee } from "./lencoFees.js";
import { generateAiResponse } from "./googleAi.js";
setGlobalOptions({
  region: "us-central1",
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

type AiChatPayload = {
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: {
    topic?: string;
  };
};

const BOOKING_PAYMENTS_COLLECTION = "booking_payments";
const NOTIFICATION_TOKENS_COLLECTION = "notification_tokens";
const NOTIFICATION_PREFERENCES_COLLECTION = "notification_preferences";
const LISTER_EARNINGS_COLLECTION = "lister_earnings";
const LISTER_EARNING_ENTRIES_COLLECTION = "lister_earning_entries";
const LISTER_WITHDRAWALS_COLLECTION = "lister_withdrawals";
const messaging = getMessaging();
const callableOptions = { cors: true } as const;

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

export const sendContactEmail = onCall<ContactPayload>(callableOptions, async (request) => {
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

export const chatWithGoogleAi = onCall<AiChatPayload>(callableOptions, async (request) => {
  const rawMessages = request.data?.messages ?? [];
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    throw new HttpsError("invalid-argument", "Send at least one message.");
  }

  const messages: AiMessage[] = rawMessages
    .slice(-12)
    .map(
      (message): AiMessage => ({
        role: message?.role === "assistant" ? "assistant" : "user",
        content: typeof message?.content === "string" ? message.content : "",
      }),
    )
    .filter((message) => message.content.trim().length > 0);

  if (messages.length === 0) {
    throw new HttpsError("invalid-argument", "Message content is required.");
  }

  const reply = await generateAiResponse(messages);
  return { reply };
});

export const saveUserMessagingToken = onCall<{ token?: string; platform?: string }>(callableOptions, async (request) => {
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

  const preferencesSnap = await db.collection(NOTIFICATION_PREFERENCES_COLLECTION).doc(userId).get();
  const preferences = preferencesSnap.exists ? preferencesSnap.data() : {};
  const pushEnabled = preferences?.push_general !== false;
  const emailEnabled = preferences?.email_general === true;

  const tokensSnapshot = await db
    .collection(NOTIFICATION_TOKENS_COLLECTION)
    .where("user_id", "==", userId)
    .get();

  if (tokensSnapshot.empty) {
    logger.info("No notification tokens for user", { userId });
    return;
  }

  const tokens = tokensSnapshot.docs.map((docSnap) => docSnap.id || docSnap.get("token")).filter(Boolean) as string[];
  if (pushEnabled && tokens.length > 0) {
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
  }

  if (emailEnabled) {
    await sendNotificationEmail({
      userId,
      notificationId: snapshot.id,
      title: notification.title ?? "New notification",
      message: notification.message ?? "",
      type: notification.type ?? "info",
      relatedId: notification.related_id ?? null,
    });
  }
});

export const recordBookingEarnings = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const booking = snapshot.data() as any;
  if (!booking?.host_id || !booking?.total_price) {
    return;
  }

  const status = (booking.status ?? "").toLowerCase();
  if (status !== "confirmed" && status !== "completed") {
    return;
  }

  const entryRef = db.collection(LISTER_EARNING_ENTRIES_COLLECTION).doc(snapshot.id);
  const existingEntry = await entryRef.get();
  if (existingEntry.exists) {
    return;
  }

  const grossAmount = Number(booking.total_price) || 0;
  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    return;
  }

  const platformFee = (grossAmount * config.platform.feePercent) / 100;
  const lencoFee = calculateLencoFee(grossAmount);
  const netAmount = Math.max(grossAmount - platformFee - lencoFee, 0);
  const currency = booking.currency ?? booking.payment_metadata?.currency ?? "ZMW";
  const earnedTimestamp =
    booking.completed_at instanceof Timestamp
      ? booking.completed_at
      : booking.updated_at instanceof Timestamp
        ? booking.updated_at
        : booking.created_at instanceof Timestamp
          ? booking.created_at
          : Timestamp.now();

  await db.runTransaction(async (transaction) => {
    const currentEntry = await transaction.get(entryRef);
    if (currentEntry.exists) {
      return;
    }

    transaction.set(entryRef, {
      booking_id: snapshot.id,
      host_id: booking.host_id,
      property_id: booking.property_id ?? null,
      gross_amount: grossAmount,
      platform_fee: platformFee,
      lenco_fee: lencoFee,
      net_amount: netAmount,
      currency,
      status: "available",
      earned_at: earnedTimestamp,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const earningsRef = db.collection(LISTER_EARNINGS_COLLECTION).doc(booking.host_id);
    transaction.set(
      earningsRef,
      {
        user_id: booking.host_id,
        total_gross: FieldValue.increment(grossAmount),
        total_platform_fee: FieldValue.increment(platformFee),
        total_lenco_fee: FieldValue.increment(lencoFee),
        available_balance: FieldValue.increment(netAmount),
        currency,
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      },
      { merge: true },
    );
  });

  await createUserNotification({
    userId: booking.host_id,
    title: "Booking earnings updated",
    message: `Net earnings of ZMW ${netAmount.toFixed(2)} recorded for booking ${snapshot.id}.`,
    type: "success",
    relatedId: snapshot.id,
  });
});

export const initiateWithdrawal = onCall<{
  amount?: number;
  msisdn?: string;
  operator?: string;
}>(callableOptions, async (request) => {
  const authCtx = request.auth;
  if (!authCtx?.uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const rawAmount = Number(request.data?.amount);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new HttpsError("invalid-argument", "Amount must be a positive number.");
  }

  const msisdn = (request.data?.msisdn ?? "").trim();
  if (!/^\d{9,15}$/.test(msisdn)) {
    throw new HttpsError("invalid-argument", "Enter a valid phone number.");
  }

  if (typeof request.data?.operator !== "string") {
    throw new HttpsError("invalid-argument", "Operator is required.");
  }
  const operator = normalizeOperator(request.data.operator);

  const lencoFee = calculateLencoFee(rawAmount);
  const totalDeducted = rawAmount + lencoFee;

  const earningsRef = db.collection(LISTER_EARNINGS_COLLECTION).doc(authCtx.uid);
  const reference = `withdraw_${authCtx.uid}_${Date.now()}`;

  let currency = "ZMW";

  await db.runTransaction(async (transaction) => {
    const earningsSnap = await transaction.get(earningsRef);
    const currentBalance = earningsSnap.exists ? earningsSnap.get("available_balance") ?? 0 : 0;
    currency = earningsSnap.exists ? earningsSnap.get("currency") ?? "ZMW" : "ZMW";

    if (currentBalance < totalDeducted) {
      throw new HttpsError("failed-precondition", "Insufficient balance for this withdrawal.");
    }

    transaction.set(
      db.collection(LISTER_WITHDRAWALS_COLLECTION).doc(reference),
      {
        user_id: authCtx.uid,
        reference,
        amount_requested: rawAmount,
        lenco_fee: lencoFee,
        total_deducted: totalDeducted,
        currency,
        target_msisdn: msisdn,
        operator,
        status: "pending",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: false },
    );

    transaction.set(
      earningsRef,
      {
        user_id: authCtx.uid,
        available_balance: FieldValue.increment(-totalDeducted),
        currency,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );
  });

  const payout = await initiateMobileMoneyPayout({
    amount: rawAmount,
    currency,
    reference,
    phone: msisdn,
    operator,
  });

  await db
    .collection(LISTER_WITHDRAWALS_COLLECTION)
    .doc(reference)
    .set(
      {
        payout_reference: payout.reference ?? payout.id ?? null,
        status: payout.status ?? "processing",
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );

  await createUserNotification({
    userId: authCtx.uid,
    title: "Withdrawal requested",
    message: `We started processing your withdrawal of ZMW ${rawAmount.toFixed(2)}.`,
    type: "info",
    relatedId: reference,
  });

  return { success: true, reference };
});

export const reconcileWithdrawals = onSchedule(
  { schedule: "every 5 minutes", region: "us-central1" },
  async () => {
  const pendingSnapshot = await db
    .collection(LISTER_WITHDRAWALS_COLLECTION)
    .where("status", "in", ["pending", "processing"])
    .orderBy("created_at", "asc")
    .limit(50)
    .get();

  if (pendingSnapshot.empty) {
    return;
  }

  for (const docSnap of pendingSnapshot.docs) {
    const withdrawal = docSnap.data();
    const reference = withdrawal.reference;
    if (!reference) continue;

    try {
      const payout = await getPayoutStatusByReference(reference);
      const normalizedStatus = (payout.status ?? "").toLowerCase();

      if (normalizedStatus === "pending" || normalizedStatus === "processing") {
        continue;
      }

      const isSuccess = normalizedStatus === "success" || normalizedStatus === "completed";
      const withdrawalRef = docSnap.ref;

      if (isSuccess) {
        await withdrawalRef.set(
          {
            status: "completed",
            processed_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true },
        );

        await createUserNotification({
          userId: withdrawal.user_id,
          title: "Withdrawal completed",
          message: `We sent ZMW ${withdrawal.amount_requested?.toFixed?.(2) ?? withdrawal.amount_requested} to ${withdrawal.target_msisdn}.`,
          type: "success",
          relatedId: withdrawal.reference,
        });
      } else {
        await db.runTransaction(async (transaction) => {
          transaction.set(
            withdrawalRef,
            {
              status: "failed",
              failure_reason:
                typeof payout.raw === "object" && payout.raw && "message" in payout.raw
                  ? (payout.raw as Record<string, unknown>).message ?? payout.status
                  : payout.status,
              updated_at: serverTimestamp(),
            },
            { merge: true },
          );

          transaction.set(
            db.collection(LISTER_EARNINGS_COLLECTION).doc(withdrawal.user_id),
            {
              user_id: withdrawal.user_id,
              available_balance: FieldValue.increment(withdrawal.total_deducted ?? 0),
              updated_at: serverTimestamp(),
            },
            { merge: true },
          );
        });

        await createUserNotification({
          userId: withdrawal.user_id,
          title: "Withdrawal failed",
          message: "We were unable to process your withdrawal. The funds were returned to your balance.",
          type: "error",
          relatedId: withdrawal.reference,
        });
      }
    } catch (error) {
      logger.warn("Failed to reconcile withdrawal", { reference, error });
    }
  }
});

export const notifyListingSubmission = onDocumentCreated("properties/{propertyId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const property = snapshot.data() as any;
  const hostId = property?.host_id;
  if (!hostId) {
    return;
  }

  const status = (property.approval_status ?? "pending").toLowerCase();
  if (status !== "pending") {
    return;
  }

  await createUserNotification({
    userId: hostId,
    title: "Listing submitted",
    message: `We received "${property.title ?? "your property"}". We'll notify you once it's reviewed.`,
    type: "info",
    relatedId: snapshot.id,
  });

  await db.collection("notification_queue").add({
    type: "listing_submission",
    user_id: hostId,
    to: config.notifications.contactRecipient,
    payload: {
      propertyId: snapshot.id,
      hostId,
      title: property.title ?? "",
      location: property.location ?? "",
    },
    created_at: serverTimestamp(),
    processed: false,
  });
});

export const approveListing = onCall<{ propertyId?: string; notes?: string }>(callableOptions, async (request) => {
  const admin = await ensureAdmin(request.auth);
  const propertyId = request.data?.propertyId;
  if (!propertyId || typeof propertyId !== "string") {
    throw new HttpsError("invalid-argument", "propertyId is required.");
  }

  const propertyRef = db.collection("properties").doc(propertyId);
  const propertySnap = await propertyRef.get();
  if (!propertySnap.exists) {
    throw new HttpsError("not-found", "Property not found.");
  }
  const property = propertySnap.data() ?? {};

  await propertyRef.set(
    {
      approval_status: "approved",
      approval_notes: request.data?.notes ?? null,
      reviewed_by: admin.uid,
      is_active: true,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );

  await createUserNotification({
    userId: property.host_id,
    title: "Listing approved",
    message: `Your property "${property.title ?? ""}" is now live.`,
    type: "success",
    relatedId: propertyId,
  });

  await logAdminAction({
    actorId: admin.uid,
    action: "Approved property listing",
    entityId: propertyId,
    metadata: { notes: request.data?.notes ?? null },
  });

  return { success: true };
});

export const declineListing = onCall<{ propertyId?: string; reason?: string }>(callableOptions, async (request) => {
  const admin = await ensureAdmin(request.auth);
  const propertyId = request.data?.propertyId;
  if (!propertyId || typeof propertyId !== "string") {
    throw new HttpsError("invalid-argument", "propertyId is required.");
  }

  const propertyRef = db.collection("properties").doc(propertyId);
  const propertySnap = await propertyRef.get();
  if (!propertySnap.exists) {
    throw new HttpsError("not-found", "Property not found.");
  }
  const property = propertySnap.data() ?? {};

  await propertyRef.set(
    {
      approval_status: "declined",
      approval_notes: request.data?.reason ?? null,
      reviewed_by: admin.uid,
      is_active: false,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );

  await createUserNotification({
    userId: property.host_id,
    title: "Listing declined",
    message: request.data?.reason
      ? `Reason: ${request.data.reason}`
      : `Your property "${property.title ?? ""}" was declined. Please review requirements.`,
    type: "warning",
    relatedId: propertyId,
  });

  await logAdminAction({
    actorId: admin.uid,
    action: "Declined property listing",
    entityId: propertyId,
    metadata: { reason: request.data?.reason ?? null },
  });

  return { success: true };
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

export const initiateBookingMobileMoneyPayment = onCall<BookingPaymentPayload>(callableOptions, async (request) => {
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
  callableOptions,
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

export const createSubscriptionCheckout = onCall<SubscriptionCheckoutPayload>(callableOptions, async (request) => {
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

export const createPartnerCheckout = onCall<PartnerCheckoutPayload>(callableOptions, async (request) => {
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

export const checkPartnerSubscription = onCall(callableOptions, async (request) => {
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
  },
);

export const reconcileLencoPayments = onSchedule(
  { schedule: "every 15 minutes", region: "us-central1" },
  async () => {
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
  },
);

export const processCommissionPayouts = onSchedule(
  { schedule: "every 24 hours", region: "us-central1" },
  async () => {
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
  },
);
const ensureAdmin = async (authCtx: any) => {
  if (!authCtx?.uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  if (authCtx.token?.isAdmin) {
    return { uid: authCtx.uid };
  }
  const adminSnap = await db.collection("admin_users").doc(authCtx.uid).get();
  if (!adminSnap.exists || adminSnap.get("is_active") !== true) {
    throw new HttpsError("permission-denied", "Admin privileges required.");
  }
  return { uid: authCtx.uid, adminType: adminSnap.get("admin_type") ?? null };
};

const logAdminAction = async (payload: {
  actorId: string;
  action: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
}) => {
  await db.collection("admin_activity_logs").add({
    actor_id: payload.actorId,
    action: payload.action,
    entity_id: payload.entityId,
    entity_type: "property",
    severity: "info",
    metadata: payload.metadata ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

const createUserNotification = async (payload: {
  userId?: string | null;
  title: string;
  message: string;
  type?: string;
  relatedId?: string | null;
}) => {
  if (!payload.userId) return;
  await db.collection("notifications").add({
    user_id: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type ?? "info",
    related_id: payload.relatedId ?? null,
    is_read: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  await db.collection("notification_queue").add({
    type: "user_notification_email",
    user_id: payload.userId,
    notification_id: null,
    payload: {
      title: payload.title,
      message: payload.message,
      type: payload.type ?? "info",
      related_id: payload.relatedId ?? null,
    },
    created_at: serverTimestamp(),
    processed: false,
  });
};
const sendNotificationEmail = async (payload: {
  userId?: string | null;
  notificationId: string;
  title: string;
  message: string;
  type?: string;
  relatedId?: string | null;
}) => {
  if (!payload.userId) return;

  const preferencesSnap = await db.collection(NOTIFICATION_PREFERENCES_COLLECTION).doc(payload.userId).get();
  const preferences = preferencesSnap.exists ? preferencesSnap.data() : {};
  if (preferences?.email_general !== true) {
    return;
  }

  const profileSnap = await db.collection("profiles").doc(payload.userId).get();
  const email = profileSnap.exists ? profileSnap.get("email") : null;
  if (!email) {
    return;
  }

  await db.collection("notification_queue").add({
    type: "user_notification_email",
    user_id: payload.userId,
    notification_id: payload.notificationId,
    to: email,
    payload: {
      title: payload.title,
      message: payload.message,
      type: payload.type ?? "info",
      related_id: payload.relatedId ?? null,
    },
    created_at: serverTimestamp(),
    processed: false,
  });
};
