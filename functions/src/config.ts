import { logger } from "firebase-functions";
import { config as functionsConfig } from "firebase-functions";

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    logger.error(`Missing required configuration: ${key}`);
    throw new Error(`Configuration value '${key}' is not set`);
  }
  return value;
};

const runtimeConfig = (() => {
  try {
    return functionsConfig();
  } catch (error) {
    logger.warn("Failed to read firebase functions config; falling back to env only", { error });
    return {} as Record<string, unknown>;
  }
})();

const readConfigValue = (envKey: string, path: string[]): string | undefined => {
  if (process.env[envKey]) {
    return process.env[envKey];
  }

  let cursor: unknown = runtimeConfig;
  for (const segment of path) {
    if (cursor && typeof cursor === "object" && segment in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof cursor === "string" ? cursor : undefined;
};

export const config = {
  lenco: {
    apiKey: required(readConfigValue("LENCO_API_KEY", ["lenco", "api_key"]), "lenco.api_key"),
    baseUrl:
      readConfigValue("LENCO_BASE_URL", ["lenco", "base_url"]) ?? "https://sandbox.lenco.ng/api/v2",
    businessId: required(readConfigValue("LENCO_BUSINESS_ID", ["lenco", "business_id"]), "lenco.business_id"),
    partnerPortalUrl: readConfigValue("LENCO_PARTNER_PORTAL_URL", ["lenco", "partner_portal_url"]),
  },
  notifications: {
    contactRecipient: required(
      readConfigValue("CONTACT_RECIPIENT", ["notifications", "contact_recipient"]),
      "notifications.contact_recipient",
    ),
    contactCc: readConfigValue("CONTACT_CC", ["notifications", "contact_cc"]),
  },
};
