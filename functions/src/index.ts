import { initializeApp } from "firebase-admin/app";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger, setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { config } from "./config.js";
import { acceptPayment, getPaymentStatus, MobileMoneyNetwork } from "./lencoClient.js";
import { db, serverTimestamp } from "./firestore.js";

initializeApp();
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
  subscriptionTier: string;
  amount: number;
  currency?: string;
  mobileMoneyNetwork: MobileMoneyNetwork;
  msisdn: string;
};

const validateNetwork = (network: string): MobileMoneyNetwork => {
  const upper = network.toUpperCase();
  if (upper !== "AIRTEL" && upper !== "MTN" && upper !== "ZAMTEL") {
    throw new HttpsError("invalid-argument", "Unsupported mobile money network");
  }
  return upper as MobileMoneyNetwork;
};

const maskPhone = (value: string) => value.replace(/.(?=.{4})/g, "*");

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
    cc: config.notifications.contactCc || null,
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

export const partnerCustomerPortal = onCall(async () => {
  if (!config.lenco.partnerPortalUrl) {
    throw new HttpsError("failed-precondition", "Partner portal URL is not configured.");
  }

  return {
    success: true,
    url: config.lenco.partnerPortalUrl,
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
