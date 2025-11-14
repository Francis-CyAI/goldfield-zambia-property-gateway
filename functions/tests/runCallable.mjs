#!/usr/bin/env node
/**
 * Simple helper to call callable Cloud Functions on the local emulator.
 *
 * Usage:
 *   node tests/runCallable.mjs <functionName> '<jsonPayload>'
 *   node tests/runCallable.mjs checkBookingMobileMoneyPaymentStatus '{"reference":"booking_demo"}'
 *   node tests/runCallable.mjs createSubscriptionCheckout @payloads/subscription.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const usage = `Usage:
  node tests/runCallable.mjs <functionName> '<jsonPayload>'
  node tests/runCallable.mjs <functionName> @path/to/payload.json

Environment overrides:
  FIREBASE_PROJECT_ID      (default: goldfield-8180d)
  FIREBASE_REGION          (default: africa-south1)
  FUNCTIONS_EMULATOR_HOST  (default: localhost)
  FUNCTIONS_EMULATOR_PORT  (default: 5001)
  FUNCTIONS_EMULATOR_PROTOCOL (default: http)
`;

const parsePayloadArg = async (arg) => {
  if (!arg) {
    return {};
  }

  if (arg.startsWith("@")) {
    const filePath = resolve(process.cwd(), arg.slice(1));
    const fileContents = await readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  }

  return JSON.parse(arg);
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const baseConfig = {
  projectId:
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.PROJECT_ID ??
    "goldfield-8180d",
  region: process.env.FIREBASE_REGION ?? "africa-south1",
  protocol: process.env.FUNCTIONS_EMULATOR_PROTOCOL ?? "http",
  host: process.env.FUNCTIONS_EMULATOR_HOST ?? "localhost",
  port: toNumber(process.env.FUNCTIONS_EMULATOR_PORT, 5001),
};

const buildCallableUrl = (functionName) => {
  const origin = `${baseConfig.protocol}://${baseConfig.host}:${baseConfig.port}`;
  return `${origin}/${baseConfig.projectId}/${baseConfig.region}/${functionName}`;
};

const main = async () => {
  const [, , functionName, payloadArg] = process.argv;
  if (!functionName || functionName === "--help" || functionName === "-h") {
    console.log(usage);
    process.exit(functionName ? 0 : 1);
  }

  let payload;
  try {
    payload = await parsePayloadArg(payloadArg);
  } catch (error) {
    console.error("Failed to parse payload:", error.message);
    process.exit(1);
  }

  const url = buildCallableUrl(functionName);
  console.log(`Calling ${functionName} via ${url}`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      console.error(`\nFunction invocation failed (${response.status})`);
      if (parsed) {
        console.error(JSON.stringify(parsed, null, 2));
      } else {
        console.error(text);
      }
      process.exit(1);
    }

    const result = parsed?.result ?? parsed ?? text;
    console.log("\nResponse:");
    console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error calling function:", error);
    process.exit(1);
  }
};

main();
