# Firebase Core Setup Audit

## Environment Variables
- `.env` is the single source for both Vite and Cloud Functions (loaded in `functions/src/env.ts`).
- Keep these values in sync with the Firebase console (`Project settings` → `General`).
- Required keys now cover Firebase (`VITE_FIREBASE_*`, `VITE_USE_FIREBASE_EMULATOR`) plus backend-only secrets (`LENCO_*`, `CONTACT_*`).
- Rotate credentials through the console and update `.env` when necessary.
- Verified usage: `src/lib/constants/firebase.ts` gate-keeps all `import.meta.env.VITE_FIREBASE_*` reads and `functions/src/config.ts` only references `process.env`.
- Supabase-specific utilities and edge functions have been removed. Firebase handles auth, data, storage, and functions.

## Current Commands
```sh
firebase login
firebase use goldfield-8180d
firebase emulators:start --only firestore,auth,functions
firebase deploy --only hosting:goldfield-zambia-property-gateway
```

## Outstanding Tasks
- Harden Firebase security rules for each collection (profiles, properties, bookings, admin collections).
- Implement Firebase Functions for contact email, subscription checkout, partner portal, and sample-data seeding (callable functions referenced in client code).
- Expand end-to-end tests to cover new Firestore flows (wishlist, booking requests, admin operations).
