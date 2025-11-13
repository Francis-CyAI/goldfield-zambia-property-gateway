# Payments & Integrations Overview

The Firebase backend replaces the previous Supabase Edge Functions and Stripe flows with Lenco’s mobile money APIs for Zambian networks. All payment orchestration happens in Callable Cloud Functions so that client code never exposes Lenco credentials.

## Environment Variables

All Firebase Functions read from the shared project `.env`. Populate at least:

| Key | Purpose |
| --- | --- |
| `LENCO_API_KEY` | Bearer token for Lenco API requests. |
| `LENCO_BASE_URL` | Base URL for the Lenco API (defaults to `https://api.lenco.co/access/v2`). |
| `CONTACT_RECIPIENT` | Email address that should receive contact form submissions. |

## Callable Functions

| Name | Responsibility |
| --- | --- |
| `sendContactEmail` | Persists contact submissions in Firestore and sends a notification email via a webhook/3rd party provider. |
| `createSubscriptionCheckout` | Initiates a Lenco mobile money payment for a platform subscription, storing the payment intent and returning tracking metadata to the client. |
| `checkPartnerSubscription` | Confirms the latest Lenco payment status for partner subscriptions and reconciles the Firestore documents. |
| `createPartnerCheckout` | Starts a partner subscription payment (pay-as-you-go or tiered) and records the payment reference for follow-up. |

## Background Automation

- `reconcileLencoPayments` (scheduled) periodically polls Lenco for any payments still marked `pending` and updates Firestore collections (`user_subscriptions`, `partner_subscriptions`, `platform_commissions`) accordingly.
- `processCommissionPayouts` (scheduled/queue) can be expanded to trigger downstream settlement workflows once bookings are confirmed.

## Firestore Collections

| Collection | Changes |
| --- | --- |
| `user_subscriptions` | Adds `lenco_customer_id`, `lenco_payment_reference`, `last_payment_status`, `next_billing_at`. |
| `partner_subscriptions` | Adds `lenco_customer_id`, `lenco_payment_reference`, `last_payment_status`, `current_period_start`, `current_period_end`. |
| `partner_payments` | New collection storing raw payment attempts for auditing and reconciliation. |
| `contact_messages` | Stores contact form payloads and notification state. |

## Client Integration

- `src/pages/Contact.tsx` calls `sendContactEmail` and shows success/error feedback.
- `src/hooks/useSubscription.ts` and `src/hooks/usePartnerSubscription.ts` call the Lenco-backed functions when starting or updating subscriptions, and store the payment metadata received from the backend.

## Mobile Money Flow

1. Client calls the relevant callable function with the user’s MSISDN, network, amount, etc.
2. Cloud Function issues a `POST /accept-payments` request to Lenco with `payment_channel: "MOBILE_MONEY"` and supported networks (`Airtel`, `MTN`, `Zamtel`).
3. Lenco immediately returns a payment reference; the function stores it and returns it to the client.
4. The scheduled reconciliation function uses the reference (or ID) to poll `/payments/{reference}` until a terminal status (`SUCCESS`, `FAILED`, `CANCELLED`) is reached and updates Firestore.
5. Firestore security rules already ensure only owners/admins can read subscription metadata and related payment details.

This setup keeps sensitive operations on the server, allows for asynchronous confirmation of mobile money payments, and supports future automation (commission payouts, renewals) without exposing credentials to the front end.
