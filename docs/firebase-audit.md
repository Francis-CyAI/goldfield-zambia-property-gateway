# Firebase Core Setup Audit

## Environment Variables
- `.env` now contains only Firebase keys required by Vite.
- Keep these values in sync with the Firebase console (`Project settings` → `General`).
- Rotate credentials through the console and update `.env` when necessary.
- Verified usage: `src/lib/constants/firebase.ts` is the single entry point that reads `import.meta.env.VITE_FIREBASE_*`, enforcing validation through `requireEnv`.
- No runtime code references `SUPABASE_*` environment variables; Supabase utilities hard-code credentials and live under `src/integrations/supabase` and `supabase/functions`.

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
- Supabase Edge Function code persists inside `supabase/functions/**`, including the use of `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Recommendation: prioritize replacing Supabase authentication and data access with Firestore/Storage equivalents before removing the dependency from `package.json`.
- Once each module is migrated, delete `@supabase/supabase-js`, remove `src/integrations/supabase`, and prune the `supabase/functions` directory (after recreating equivalents as Firebase Cloud Functions).
