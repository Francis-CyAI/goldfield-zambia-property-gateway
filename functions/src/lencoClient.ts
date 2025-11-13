import { logger } from "firebase-functions";
import { config } from "./config.js";

export type MobileMoneyNetwork = "AIRTEL" | "MTN" | "ZAMTEL";

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
