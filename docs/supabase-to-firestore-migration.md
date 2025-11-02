# Supabase → Firestore Migration Plan

This document outlines how to migrate existing Supabase data into the new Firebase schemas. The goal is to cut over without downtime while preserving booking history, host information, and admin records.

## 1. Scope & Collections

| Supabase Table (legacy)      | Firestore Collection             | Notes on Transformations |
|-----------------------------|----------------------------------|---------------------------|
| `profiles`                  | `profiles`                       | Preserve `id` as doc ID, convert timestamps to ISO or Firestore `Timestamp`. |
| `properties`                | `properties`                     | Map `host_id`, normalise `images` array, ensure boolean flags (`is_active`). |
| `property_availability`     | `property_availability`          | Use deterministic doc IDs (`${property_id}_${date}`). |
| `property_locations`        | `property_locations`             | Keep geo fields, add `created_at`/`updated_at` if missing. |
| `property_views`            | `property_views`                 | Consider trimming legacy PII before import. |
| `bookings`                  | `bookings`                       | Align `status` enum with new values (`pending`, `confirmed`, `cancelled`, `completed`). |
| `booking_requests`          | `booking_requests`               | Preserve `message`, recompute default `expires_at` if absent. |
| `platform_commissions`      | `platform_commissions`           | Ensure monetary fields are numeric. |
| `notifications`             | `notifications`                  | Strip read flags for archived entries if necessary. |
| `messages`                  | `messages`                       | Populate `participants` array `[sender_id, recipient_id]`. |
| `saved_searches`            | `saved_searches`                 | Ensure `search_criteria` serialises as JSON object. |
| `reviews`                   | `reviews`                        | Nest `host_response` structure as defined in models. |
| `subscription_tiers`        | `subscription_tiers`             | Copy static reference data first. |
| `user_subscriptions`        | `user_subscriptions`             | Embed Stripe identifiers. |
| `partner_subscription_tiers`| `partner_subscription_tiers`     | Copy static tier definitions. |
| `partner_subscriptions`     | `partner_subscriptions`          | Ensure `status` is lowercased. |
| `branches`                  | `branches`                       | Optional for admin dashboards. |
| `admin_users`               | `admin_users`                    | Migrate active flags and admin types. |
| `admin_activity_logs`       | `admin_activity_logs`            | Consider truncating to a rolling window to reduce import time. |

## 2. Pre-Migration Checklist

- [ ] Freeze Supabase writes during the migration window or operate in read-only mode.
- [ ] Export a full database backup for rollback.
- [ ] Enable the Firebase Emulator Suite and test scripts end-to-end before touching production.
- [ ] Ensure Firestore security rules and composite indexes are deployed.
- [ ] Prepare `.serviceAccountKey.json` with admin privileges for scripted imports.

## 3. Data Export

Use the Supabase CLI or SQL queries to export each table in JSON/CSV. Example with the CLI:

```sh
supabase db dump --project-ref <supabase-project-id> --table profiles --data-only --file exports/profiles.sql
supabase db dump --project-ref <supabase-project-id> --table properties --data-only --file exports/properties.sql
```

Alternatively, run SQL `COPY ... TO STDOUT WITH CSV` commands per table. Prefer JSON when nested objects exist (e.g. `search_criteria`).

## 4. Transformations

Create a Node.js (or Bun) script that:

1. Parses each dump into JavaScript objects.
2. Normalises field names to match Firestore expectations (snake_case preserved, ensure arrays are arrays).
3. Converts Supabase timestamps to JavaScript `Date` objects so they serialise as Firestore `Timestamp`.
4. Builds deterministic document IDs where required (availability, wishlist, etc.).
5. Drops Supabase-specific columns (e.g. `user_metadata`, `updated_at` triggers) if they no longer apply.

Keep transformations idempotent so the script can be rerun safely against the emulator.

## 5. Import to Firestore

Example import flow using the Firebase Admin SDK:

```ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp({ credential: cert('./serviceAccountKey.json') });
const db = getFirestore();

await db.runTransaction(async (tx) => {
  const batch = db.batch();
  for (const profile of profiles) {
    const ref = db.collection('profiles').doc(profile.id);
    batch.set(ref, {
      ...profile,
      created_at: Timestamp.fromDate(new Date(profile.created_at)),
      updated_at: Timestamp.fromDate(new Date(profile.updated_at)),
    });
  }
  await batch.commit();
});
```

- Load critical collections first (`profiles`, `properties`, admin tables).
- Import booking-related data next, ensuring references (`property_id`, `guest_id`, `host_id`) already exist.
- Populate aggregate collections (`property_views`, `admin_activity_logs`) last; consider sampling if volume is high.

Use `firebase emulators:start --import` during dry runs and inspect results with the Emulator UI.

## 6. Validation

- Write smoke tests that fetch a sample per collection and assert required fields exist.
- Cross-check row counts between Supabase tables and Firestore collections.
- Spot check relationships (e.g. a booking’s `property_id` exists and `host_id` matches the property owner).
- Validate admin permissions by logging into staging and confirming dashboards render correctly.

## 7. Cutover

1. Pause Supabase client writes (or temporarily block API routes).
2. Run the final export + import sequence against production Firestore.
3. Update environment variables to disable any Supabase references.
4. Smoke test critical user flows (sign-in, booking, admin analytics).
5. Monitor logs and Firestore usage; keep Supabase backups for at least one release cycle.

## 8. Post-Migration Cleanup

- Decommission Supabase tables or downgrade the plan once confidence is high.
- Remove Supabase credentials from deployment environments.
- Archive migration scripts and export archives in a secure storage location.
