# Configuration & Deployment Instructions

## Initial setup
- [ ] Install dependencies: `npm install` (root) and `npm install --prefix functions`.
- [ ] Copy `.env` template and set all Firebase values plus project-specific secrets (LENCO, `PLATFORM_FEE_PERCENT`, etc.).

## Local workflow
- [ ] Run Vite dev server: `npm run dev`.
- [ ] Use Firebase emulators when iterating on Functions: `npm --prefix functions run build && firebase emulators:start --only functions`.
- [ ] Rebuild Functions whenever TS changes (`npm --prefix functions run build` or `build:watch`).

## Admin bootstrap
- [ ] Place a Firebase service account JSON outside version control (e.g., `secrets/...json`).
- [ ] Grant IAM roles to that service account: `roles/serviceusage.serviceUsageConsumer` and `roles/firebase.admin`.
- [ ] Run `node scripts/create-admin.js` (after setting `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT`).
- [ ] Log in with the generated credentials and visit `/admin`.

## Property listing workflow
- [ ] Ensure new listings remain pending until an admin approves them.
- [ ] Deploy updated Firestore rules to enforce owner/admin restrictions:
  - Owners can create/update only their own listings and cannot change approval state.
  - Admins control `approval_status`, `is_active`, `approval_notes`.
  - Public reads are limited to approved + active listings.
- [ ] After rule changes, deploy: `firebase deploy --only firestore:rules`.

## Revenue tracking & payouts
- [ ] Set `PLATFORM_FEE_PERCENT` in `.env` (default 10% if omitted).
- [ ] After implementing revenue logic, redeploy rules/functions:
  ```sh
  firebase deploy --only firestore:rules,functions:recordBookingEarnings,functions:saveUserMessagingToken,functions:sendPushForNotification,functions:approveListing,functions:declineListing,functions:initiateWithdrawal,functions:reconcileWithdrawals
  ```
  (Include other functions from previous steps if they changed.)
- [ ] Create a test booking (status confirmed) to ensure `lister_earnings` and `lister_earning_entries` populate, and verify the Property Owner dashboard reflects balances.
- [ ] Submit a test withdrawal from the Property Owner dashboard (use a sandbox MSISDN). Confirm:
  - [ ] A document is created in `lister_withdrawals`.
  - [ ] Available balance decreases by the withdrawal amount plus fee.
  - [ ] The withdrawal history card and notifications show the new record/status.
- [ ] If Lenco fee tiers change, update `functions/src/lencoFees.ts` to match their latest schedule and redeploy the functions command above.

## Web push notifications & email opt-in
- [ ] Generate a Web Push certificate (Firebase Console → Cloud Messaging) and set `VITE_FIREBASE_MESSAGING_VAPID_KEY` in `.env`.
- [ ] Confirm `public/firebase-messaging-sw.js` is served (Vite copies files from `public/`).
- [ ] Deploy security rules and messaging functions together:
  ```sh
  firebase deploy --only firestore:rules,functions:recordBookingEarnings,functions:notifyListingSubmission,functions:saveUserMessagingToken,functions:sendPushForNotification,functions:approveListing,functions:declineListing,functions:initiateWithdrawal,functions:reconcileWithdrawals
  ```
- [ ] After deployment, log in with an admin account and trigger a test notification:
  - [ ] Push permission prompt appears, token saved in `notification_tokens`.
  - [ ] Bell count updates and `/notifications` lists the message.
  - [ ] Email is enqueued (check `notification_queue` or your mail provider).
- [ ] Use `/notifications` to manage email/push preferences during testing; ensure opt-ins are respected.
- [ ] Submit a sample property to confirm the listing submission notification/email.
- [ ] Approve/decline the sample property in the admin dashboard to verify toast messaging and host notifications.
- [ ] Submit/complete a test withdrawal to see push/email notifications at each stage.

## Post-task checklist
- [ ] `.env` includes any new keys/secrets (e.g., `VITE_FIREBASE_MESSAGING_VAPID_KEY`).
- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`).
- [ ] Functions deployed when backend code changed (see commands above).
- [ ] This instructions file updated to capture new manual steps.
