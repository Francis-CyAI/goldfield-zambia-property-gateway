# Firebase Core Setup Audit

## Environment Variables
- `.env` now contains only Firebase keys required by Vite.
- Keep these values in sync with the Firebase console (`Project settings` → `General`).
- Rotate credentials through the console and update `.env` when necessary.
- Verified usage: `src/lib/constants/firebase.ts` is the single entry point that reads `import.meta.env.VITE_FIREBASE_*`, enforcing validation through `requireEnv`.
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
