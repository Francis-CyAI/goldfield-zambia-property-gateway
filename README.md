# Zambia Property Gateway

Step-by-step instructions for working with this project.

## 1. Prerequisites
1. Install Node.js 18+ and npm.
2. Install Firebase CLI: `npm install -g firebase-tools`.
3. Authenticate CLI: `firebase login`.
4. Select project: `firebase use goldfield-8180d`.

## 2. Initial setup
1. Clone the repo and `cd` into it.
2. Install root dependencies: `npm install`.
3. Install Functions dependencies: `npm install --prefix functions`.
4. Copy `.env` and populate all required values (see section 3).

## 3. Environment variables
Create `.env` at the project root with:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=goldfield-8180d
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_REGION=africa-south1
VITE_USE_FIREBASE_FUNCTIONS_EMULATOR=true
VITE_FUNCTIONS_EMULATOR_HOST=127.0.0.1
VITE_FIREBASE_MESSAGING_VAPID_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
PLATFORM_FEE_PERCENT=10
LENCO_API_KEY=
LENCO_BASE_URL=https://api.lenco.co/access/v2
CONTACT_RECIPIENT=
```
*For CI deployments export the same variables before running `firebase deploy`.*

## 4. Local development workflow
1. (Optional) if you need emulators, create `.env.local` with the desired `VITE_USE_*_EMULATOR` flags.
2. Start Functions emulator (only when iterating on backend):
   ```bash
   npm --prefix functions run build
   firebase emulators:start --only functions
   ```
3. Start Vite dev server in another terminal:
   ```bash
   npm run dev
   ```
4. Health-check callable endpoints:
   ```bash
   curl -i http://127.0.0.1:5001/goldfield-8180d/africa-south1/initiateBookingMobileMoneyPayment \
     -X POST -H "Content-Type: application/json" \
     -d '{"data":{"bookingId":"probe","amount":10,"msisdn":"0976000000","operator":"airtel"}}'
   ```
5. Rebuild Functions when code changes (or run `npm --prefix functions run build:watch`).

## 5. Admin bootstrap
1. Place a Firebase service account JSON under `secrets/` (git-ignored).
2. Grant IAM roles to that service account (Service Usage Consumer + Firebase Admin).
3. Export `GOOGLE_APPLICATION_CREDENTIALS` (or `FIREBASE_SERVICE_ACCOUNT`) pointing to the JSON.
4. Run `node scripts/create-admin.js` and follow prompts.
5. Sign in with the generated credentials and visit `/admin`.

## 6. Web push + notifications
1. In Firebase Console → Cloud Messaging, create a Web Push certificate and set `VITE_FIREBASE_MESSAGING_VAPID_KEY`.
2. Ensure `public/firebase-messaging-sw.js` is deployed unchanged.
3. Users grant notification permission via the UI; tokens are stored in `notification_tokens`.
4. Notification preferences live at `/notifications`; verify email/push toggles before testing.

## 7. Deployment
1. Build frontend:
   ```bash
   npm run build
   ```
2. Deploy Firestore rules and Cloud Functions:
   ```bash
   firebase deploy --only firestore:rules,functions:recordBookingEarnings,functions:notifyListingSubmission,functions:saveUserMessagingToken,functions:sendPushForNotification,functions:approveListing,functions:declineListing,functions:initiateWithdrawal,functions:reconcileWithdrawals
   ```
   *To deploy all functions without enumerating them: `firebase deploy --only functions`.*
3. Deploy Hosting:
   ```bash
   firebase deploy --only hosting:goldfield-zambia-property-gateway
   ```

## 8. Post-deploy smoke tests
1. Submit a property, approve it, decline it. Confirm push/email notifications and admin logs.
2. Book a property to ensure `lister_earnings` and `lister_earning_entries` update.
3. Initiate a withdrawal with a sandbox MSISDN; verify `lister_withdrawals` and notifications.
4. Hit each callable via `curl` or `Invoke-WebRequest` to confirm CORS (e.g., booking payment, withdrawal, approvals).

## 9. Testing checklist
- Run `npm run lint` (add unit tests as needed).
- Use emulator or staging project to exercise all callables.
- Execute scripts under `functions/tests/` (e.g., `node functions/tests/runCallable.mjs approveListing '{"propertyId":"..."}'`).
- Document any gaps in `instructions.md` or create new TODO items for future coverage.
