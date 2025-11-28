#!/usr/bin/env node
/**
 * Mobile money integration smoke tests.
 *
 * Runs against the Functions emulator (preferred) or deployed callable endpoints.
 * Ensure `initiateBookingMobileMoneyPayment` and
 * `checkBookingMobileMoneyPaymentStatus` are available before running.
 */
const usage = `Usage:
  node tests/mobileMoney.test.mjs

Optional env vars:
  FIREBASE_PROJECT_ID, FIREBASE_REGION, FUNCTIONS_EMULATOR_PROTOCOL, FUNCTIONS_EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT
  TEST_BOOKING_ID, TEST_MSISDN, TEST_OPERATOR, TEST_AMOUNT
`;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const baseConfig = {
  projectId:
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.PROJECT_ID ??
    "goldfield-8180d",
  region: process.env.FIREBASE_REGION ?? "us-central1",
  protocol: process.env.FUNCTIONS_EMULATOR_PROTOCOL ?? "http",
  host: process.env.FUNCTIONS_EMULATOR_HOST ?? "localhost",
  port: toNumber(process.env.FUNCTIONS_EMULATOR_PORT, 5001),
};

const buildCallableUrl = (functionName) => {
  const origin = `${baseConfig.protocol}://${baseConfig.host}:${baseConfig.port}`;
  return `${origin}/${baseConfig.projectId}/${baseConfig.region}/${functionName}`;
};

const callFunction = async (functionName, data) => {
  const url = buildCallableUrl(functionName);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const error = new Error(
      `Callable ${functionName} failed (${response.status}): ${
        parsed ? JSON.stringify(parsed) : text
      }`,
    );
    error.response = parsed ?? text;
    throw error;
  }

  return parsed?.result ?? parsed ?? text;
};

const ctx = {
  bookingId: process.env.TEST_BOOKING_ID ?? `test-booking-${Date.now()}`,
  msisdn: process.env.TEST_MSISDN ?? "0976271799",
  operator: (process.env.TEST_OPERATOR ?? "airtel").toLowerCase(),
  amount: toNumber(process.env.TEST_AMOUNT, 10000),
  reference: null,
};

const tests = [
  {
    name: "Initiate booking mobile money payment",
    run: async () => {
      const payload = {
        bookingId: ctx.bookingId,
        amount: ctx.amount,
        msisdn: ctx.msisdn,
        operator: ctx.operator,
        metadata: {
          triggeredBy: "mobileMoney.test.mjs",
        },
      };
      console.log("[mobileMoney.test] initiate payload:", payload);

      const result = await callFunction("initiateBookingMobileMoneyPayment", payload);
      if (!result?.success || !result?.reference) {
        throw new Error("Initiation failed – missing success flag or reference");
      }
      ctx.reference = result.reference;
      return result;
    },
  },
  {
    name: "Verify payment status by reference",
    run: async () => {
      if (!ctx.reference) {
        throw new Error("No reference recorded from initiation step.");
      }
      const payload = { reference: ctx.reference };
      console.log("[mobileMoney.test] check-by-reference payload:", payload);
      const result = await callFunction("checkBookingMobileMoneyPaymentStatus", payload);
      if (!result?.success) {
        throw new Error("checkBookingMobileMoneyPaymentStatus did not succeed");
      }
      return result;
    },
  },
  {
    name: "Verify payment status by bookingId (force manual check)",
    run: async () => {
      const payload = {
        bookingId: ctx.bookingId,
        forceCheck: true,
      };
      console.log("[mobileMoney.test] check-by-booking payload:", payload);
      const result = await callFunction("checkBookingMobileMoneyPaymentStatus", payload);
      if (!result?.success) {
        throw new Error("Manual bookingId verification failed");
      }
      return result;
    },
  },
];

const run = async () => {
  console.log("Running mobile money payment tests against Functions emulator");
  console.log(`Project: ${baseConfig.projectId}, Region: ${baseConfig.region}`);
  console.log(`Endpoint base: ${baseConfig.protocol}://${baseConfig.host}:${baseConfig.port}`);
  console.log(`Test bookingId: ${ctx.bookingId}\n`);

  const results = [];
  let failures = 0;
  for (const test of tests) {
    process.stdout.write(`→ ${test.name}... `);
    try {
      const data = await test.run();
      results.push({ name: test.name, data });
      console.log("OK");
    } catch (error) {
      failures += 1;
      console.log("FAILED");
      console.error(error.message);
      if (error.response) {
        console.error(error.response);
      }
    }
  }

  console.log("\nTest results:");
  for (const result of results) {
    console.log(`- ${result.name}`);
    console.log(JSON.stringify(result.data, null, 2));
    console.log("");
  }

  if (failures > 0) {
    console.error(`${failures} test(s) failed.`);
    process.exit(1);
  } else {
    console.log("All tests passed.");
  }
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(usage);
  process.exit(0);
}

run().catch((error) => {
  console.error("Unexpected error running tests:", error);
  process.exit(1);
});
