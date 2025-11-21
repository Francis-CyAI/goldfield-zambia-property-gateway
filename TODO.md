# Project TODOs

- [x] Admin access & UI  
  - [x] Add role-based admin gate (e.g., `isAdmin` claim/field) and protect an Admin Dashboard route.  
  - [x] Build Admin Dashboard UI: listing submissions table, filtering/search, detail view, approve/decline actions (with decline message).

- [x] Listing submission flow  
  - [x] Ensure new listings are stored as “pending” with submitter info.  
  - [x] Add Firestore security rules to allow only admins to approve/decline and only owners to view their own pending/approved listings.

- [x] Notifications model  
  - [x] Define/extend `notifications` collection schema (type, userId, payload, read/unread, createdAt).  
  - [x] Add “web notification preferences” per user (opt-in/out for listing decisions, bookings, payouts).

- [x] Email notification opt-in  
  - [x] Add user profile prefs for email notifications.  
  - [x] Build functions to send email for: listing submitted (to admin), listing approved/declined (to lister, with feedback on decline), booking payout updates.  
  - [x] Add a simple UI toggle in user settings for email/web notifications.

- [x] Admin actions backend  
  - [x] Create callable HTTPS functions:  
    - [x] `approveListing(listingId, adminId, message?)`  
    - [x] `declineListing(listingId, adminId, reason)`  
  - [x] Each updates listing status, writes notifications for admin/lister, triggers email if opted in.  
  - [x] Add Firestore triggers (or within callables) to ensure atomic status + notification writes.

- [x] Revenue tracking per lister  
  - [x] Schema: per-lister earnings aggregate (e.g., `lister_earnings` doc) and per-booking ledger entries (gross, platform_fee, lenco_fee, net).  
  - [x] On booking completion: compute platform deduction (from env %) and lenco service charge (from constants tiers), store ledger entry, update lister’s available balance.  
  - [x] UI: Lister earnings page showing total earned, available balance, fees breakdown per booking, and summary cards.

- [x] Withdrawal flow  
  - [x] UI: withdrawal screen showing available balance, platform deductions already applied, and lenco fee for the chosen amount; highlight “you’ll receive X, fees Y”.  
  - [x] Backend callable: `initiateWithdrawal(listerId, amount)` that validates balance, applies fees, records withdrawal request, calls Lenco payout API, and updates balance/ledger.  
  - [x] Add webhook/polling handler for Lenco payout status to update withdrawal record and notify user.

- [x] Constants & env  
  - [x] Add env for platform fee percentage (e.g., `PLATFORM_FEE_PERCENT`).  
  - [x] Add Lenco fee tiers in a constants file.  
  - [x] Verify LENCO API keys already in env; add any needed payout endpoints configuration.

- [x] Notifications delivery  
  - [x] Web: ensure notifications are created on all key events (submission received, approval, decline, withdrawal initiated/completed/failed).  
  - [x] Email: respect user opt-in; reuse existing email sender or add a mail provider config.

- [x] Frontend wiring  
  - [x] Admin dashboard actions call new callables; optimistic updates and toasts.  
  - [x] Lister dashboard shows notifications, earnings, withdrawals, balances; consistent UI styling with existing components.

- [x] Security & rules  
  - [x] Update Firestore rules to enforce:  
    - [x] Only admins can approve/decline listings.  
    - [x] Users can read/write only their own notifications and earnings/withdrawal records.  
  - [x] Protect callables with auth checks and role checks.

- [x] Testing & verification  
  - [x] Add function tests for approve/decline, earnings calc, withdrawal, fee computation.  
  - [x] Manual test scripts for Lenco API calls in emulator/stub mode if available.  
  - [x] Check CORS for new callables via emulator curl/Invoke-WebRequest.

- [x] Docs  
  - [x] Update README with new env vars, emulator steps for new functions, and brief usage notes for admin/lister flows.

- [ ] Suggestions box
  - [ ] Add user-facing form to submit feedback/feature requests.
  - [ ] Store submissions in Firestore and surface them in the admin dashboard.

- [ ] AI chatbot integration
  - [ ] Integrate a conversational AI that answers questions about the platform.
  - [ ] Index Firestore data (listings, FAQs, etc.) so the bot can reference current information.
