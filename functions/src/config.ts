import { logger } from "firebase-functions";
import "./env.js";

const readEnvValue = (envKey: string): string | undefined => {
  const value = process.env[envKey];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return undefined;
};

const required = (envKey: string): string => {
  const value = readEnvValue(envKey);
  if (!value) {
    logger.error(`Missing required environment variable: ${envKey}`);
    throw new Error(`Environment variable '${envKey}' is not set`);
  }
  return value;
};

export const config = {
  lenco: {
    apiKey: required("LENCO_API_KEY"),
    baseUrl: readEnvValue("LENCO_BASE_URL") ?? "https://sandbox.lenco.ng/api/v2",
    businessId: required("LENCO_BUSINESS_ID"),
    partnerPortalUrl: readEnvValue("LENCO_PARTNER_PORTAL_URL"),
  },
  notifications: {
    contactRecipient: required("CONTACT_RECIPIENT"),
    contactCc: readEnvValue("CONTACT_CC"),
  },
};
