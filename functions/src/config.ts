import { logger } from "firebase-functions";
import "./env.js";

const readEnvValue = (envKey: string): string | undefined => {
  const value = process.env[envKey];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return undefined;
};

const readPositiveNumber = (envKey: string, fallback: number): number => {
  const raw = readEnvValue(envKey);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    logger.warn(`Invalid numeric value for ${envKey}. Using fallback ${fallback}.`);
    return fallback;
  }
  return parsed;
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
    baseUrl: readEnvValue("LENCO_BASE_URL") ?? "https://api.lenco.co/access/v2",
    collectionStatusCheckDurationMs:
      readPositiveNumber("LENCO_COLLECTION_CHECK_DURATION_SECONDS", 180) * 1000,
  },
  notifications: {
    contactRecipient: required("CONTACT_RECIPIENT"),
  },
  googleAi: {
    apiKey: readEnvValue("GOOGLE_AI_API_KEY"),
    model: readEnvValue("GOOGLE_AI_MODEL") ?? "gemini-1.5-flash",
    apiBase: readEnvValue("GOOGLE_AI_API_BASE") ?? "https://generativelanguage.googleapis.com",
  },
  platform: {
    feePercent: readPositiveNumber("PLATFORM_FEE_PERCENT", 10),
  },
};
