# Cloud Functions Emulator Test Scripts

Utilities in this folder help exercise callable Cloud Functions while the Firebase emulator suite is running locally.

## Requirements

- Firebase emulators running (at least the Functions emulator). Start them from the project root:
  ```bash
  firebase emulators:start --only functions
  ```
- Node 20+ (ships with the repo’s `functions` workspace).

## `runCallable.mjs`

Generic helper that issues the same POST request a Firebase Web SDK would send to a callable function.

```bash
node tests/runCallable.mjs <functionName> '<jsonPayload>'
node tests/runCallable.mjs initiateBookingMobileMoneyPayment '{"bookingId":"demo-booking","amount":15,"msisdn":"0976000000","operator":"airtel"}'
node tests/runCallable.mjs checkBookingMobileMoneyPaymentStatus '{"reference":"booking_demo_123"}'
```

You can also load payloads from disk by prefixing the second argument with `@`:

```bash
node tests/runCallable.mjs initiateBookingMobileMoneyPayment @tests/payloads/initiate-demo.json
```

Environment variables let you point to a non-default emulator host:

| Variable | Default |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `goldfield-8180d` |
| `FIREBASE_REGION` | `us-central1` |
| `FUNCTIONS_EMULATOR_PROTOCOL` | `http` |
| `FUNCTIONS_EMULATOR_HOST` | `localhost` |
| `FUNCTIONS_EMULATOR_PORT` | `5001` |

The script prints both the payload it is sending and the parsed response, so you can quickly verify flows such as mobile money initiation and repeated status checks while the UI is still under development.

## `mobileMoney.test.mjs`

End-to-end smoke tests for the booking mobile money flow. It initiates a payment and immediately calls the verification function twice (by reference and by booking ID).

```bash
firebase emulators:start --only functions
# in another terminal
node tests/mobileMoney.test.mjs
```

Optional env vars customize the payload:

| Variable | Purpose | Default |
| --- | --- | --- |
| `TEST_BOOKING_ID` | Booking ID used during test | `test-booking-<timestamp>` |
| `TEST_MSISDN` | Phone number passed to Lenco | `0976000000` |
| `TEST_OPERATOR` | Mobile money operator (`airtel`, `mtn`, `zamtel`) | `airtel` |
| `TEST_AMOUNT` | Payment amount | `10` |

The script prints JSON responses for each step and exits non-zero if any call fails.
