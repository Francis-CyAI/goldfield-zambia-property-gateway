import { logger } from "firebase-functions";
import { config } from "./config.js";

export type MobileMoneyNetwork = "AIRTEL" | "MTN" | "ZAMTEL";
export type MobileMoneyOperator = "airtel" | "mtn" | "zamtel";
export type LencoCollectionStatus =
  | "pending"
  | "successful"
  | "failed"
  | "otp-required"
  | "pay-offline"
  | "3ds-auth-required";

export interface AcceptPaymentPayload {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  narration: string;
  metadata?: Record<string, unknown>;
  network: MobileMoneyNetwork;
}

export interface LencoPaymentResponse {
  id: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  paymentUrl?: string;
  customerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LencoPaymentStatus extends LencoPaymentResponse {
  amount: number;
  currency: string;
  message?: string;
  raw?: unknown;
}

export interface MobileMoneyCollectionPayload {
  amount: number;
  reference: string;
  phone: string;
  operator: MobileMoneyOperator;
  country?: string;
  bearer?: "merchant" | "customer";
}

export interface LencoCollection {
  id: string;
  lencoReference: string;
  reference?: string | null;
  status: LencoCollectionStatus;
  amount: number;
  currency: string;
  initiatedAt?: string;
  completedAt?: string | null;
  message?: string;
  bearer?: "merchant" | "customer";
  fee?: number | null;
  settlementStatus?: "pending" | "settled" | null;
  settlement?: unknown;
  mobileMoneyDetails?: {
    country?: string;
    phone?: string;
    operator?: string;
    accountName?: string | null;
  };
  raw?: unknown;
}

const headers = () => ({
  Authorization: `Bearer ${config.lenco.apiKey}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

const handleResponse = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    logger.error("Lenco API error", { status: response.status, body: text });
    throw new Error(`Lenco API error (${response.status})`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    logger.error("Failed to parse Lenco response", { text, error });
    throw new Error("Failed to parse Lenco API response");
  }
};

const normalizeAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return 0;
};

const mapCollection = (payload: Record<string, any>): LencoCollection => {
  if (!payload) {
    throw new Error("Empty collection payload from Lenco");
  }

  return {
    id: payload.id ?? payload.reference ?? "",
    lencoReference: payload.lencoReference ?? payload.reference ?? "",
    reference: payload.reference ?? null,
    status: (payload.status ?? "pending") as LencoCollectionStatus,
    amount: normalizeAmount(payload.amount),
    currency: payload.currency ?? "ZMW",
    initiatedAt: payload.initiatedAt,
    completedAt: payload.completedAt ?? null,
    message: payload.message ?? payload.statusMessage,
    bearer: payload.bearer,
    fee: payload.fee != null ? normalizeAmount(payload.fee) : null,
    settlementStatus: payload.settlementStatus ?? payload.settlement?.status ?? null,
    settlement: payload.settlement,
    mobileMoneyDetails: payload.mobileMoneyDetails ?? undefined,
    raw: payload,
  };
};

export const initiateMobileMoneyCollection = async (
  payload: MobileMoneyCollectionPayload,
): Promise<LencoCollection> => {
  const endpoint = `${config.lenco.baseUrl}/collections/mobile-money`;
  const body = {
    amount: payload.amount,
    reference: payload.reference,
    phone: payload.phone,
    operator: payload.operator,
    country: payload.country ?? "zm",
    bearer: payload.bearer ?? "merchant",
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await handleResponse(response);
  return mapCollection(data?.data ?? data);
};

export const getCollectionStatusByReference = async (reference: string): Promise<LencoCollection> => {
  const endpoint = `${config.lenco.baseUrl}/collections/status/${reference}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers(),
  });

  const data = await handleResponse(response);
  return mapCollection(data?.data ?? data);
};

export const getCollectionById = async (id: string): Promise<LencoCollection> => {
  const endpoint = `${config.lenco.baseUrl}/collections/${id}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers(),
  });

  const data = await handleResponse(response);
  return mapCollection(data?.data ?? data);
};

export interface LencoPayout {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  raw?: unknown;
}

const mapPayout = (payload: Record<string, any>): LencoPayout => ({
  id: payload.id ?? payload.reference ?? "",
  reference: payload.reference ?? payload.id ?? "",
  status: (payload.status ?? "pending").toLowerCase(),
  amount: normalizeAmount(payload.amount),
  currency: payload.currency ?? "ZMW",
  raw: payload,
});

export const initiateMobileMoneyPayout = async (payload: {
  amount: number;
  currency?: string;
  reference: string;
  phone: string;
  operator: MobileMoneyOperator;
}) => {
  const endpoint = `${config.lenco.baseUrl}/payouts/mobile-money`;
  const body = {
    amount: payload.amount,
    currency: payload.currency ?? "ZMW",
    reference: payload.reference,
    phone: payload.phone,
    operator: payload.operator,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await handleResponse(response);
  return mapPayout(data?.data ?? data);
};

export const getPayoutStatusByReference = async (reference: string): Promise<LencoPayout> => {
  const endpoint = `${config.lenco.baseUrl}/payouts/status/${reference}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers(),
  });
  const data = await handleResponse(response);
  return mapPayout(data?.data ?? data);
};

export const acceptPayment = async (
  payload: AcceptPaymentPayload,
): Promise<LencoPaymentResponse> => {
  const endpoint = `${config.lenco.baseUrl}/accept-payments`;
  const body = {
    amount: payload.amount,
    currency: payload.currency,
    narration: payload.narration,
    paymentChannel: "MOBILE_MONEY",
    customer: {
      name: payload.customerName,
      email: payload.customerEmail,
      phone: payload.customerPhone,
    },
    mobileMoney: {
      network: payload.network,
      phoneNumber: payload.customerPhone,
    },
    metadata: payload.metadata ?? {},
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await handleResponse(response);

  return {
    id: data?.data?.id ?? data?.id,
    reference: data?.data?.reference ?? data?.reference,
    status: (data?.data?.status ?? data?.status ?? "PENDING") as LencoPaymentResponse["status"],
    paymentUrl: data?.data?.paymentUrl ?? data?.paymentUrl,
    customerId: data?.data?.customerId ?? data?.customerId,
    createdAt: data?.data?.createdAt ?? data?.createdAt,
    updatedAt: data?.data?.updatedAt ?? data?.updatedAt,
  };
};

export const getPaymentStatus = async (
  identifier: { id?: string; reference?: string },
): Promise<LencoPaymentStatus> => {
  const { id, reference } = identifier;
  const query = id ? `id=${id}` : `reference=${reference}`;
  const endpoint = `${config.lenco.baseUrl}/payments?${query}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers(),
  });

  const data = await handleResponse(response);
  const payment = Array.isArray(data?.data) ? data.data[0] : data?.data ?? data;

  return {
    id: payment?.id ?? id ?? "",
    reference: payment?.reference ?? reference ?? "",
    status: payment?.status ?? "PENDING",
    amount: payment?.amount ?? 0,
    currency: payment?.currency ?? "ZMW",
    message: payment?.message ?? payment?.statusMessage,
    paymentUrl: payment?.paymentUrl,
    customerId: payment?.customerId,
    createdAt: payment?.createdAt,
    updatedAt: payment?.updatedAt,
    raw: payment,
  };
};
