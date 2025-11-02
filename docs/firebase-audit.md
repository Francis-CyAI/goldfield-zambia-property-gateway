# Firebase Core Setup Audit

## Environment Variables
- `.env` now contains only Firebase keys required by Vite.
- Keep these values in sync with the Firebase console (`Project settings` → `General`).
- Rotate credentials through the console and update `.env` when necessary.

## Current Commands
```sh
firebase login
firebase use goldfield-8180d
firebase emulators:start --only firestore,auth,functions
firebase deploy --only hosting:goldfield-zambia-property-gateway
```

## Outstanding Supabase References
Supabase code is still present and must be migrated to Firebase services.
Quick check:
```sh
rg --files -g '*.ts' src | rg 'supabase'
```
Focus areas discovered:
- `src/contexts/AuthContext.tsx`
- `src/hooks/*` (bookings, properties, messages, notifications, subscriptions, etc.)
- `src/components/admin/*`
- `src/pages/Auth.tsx`, `Contact.tsx`, and other pages making direct Supabase calls.

Recommendation: prioritize replacing Supabase authentication and data access with Firestore/Storage equivalents before removing the dependency from `package.json`.

