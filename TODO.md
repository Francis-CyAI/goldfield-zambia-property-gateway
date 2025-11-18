# Project TODOs

- [x] Admin access & UI  
  - [x] Add role-based admin gate (e.g., `isAdmin` claim/field) and protect an Admin Dashboard route.  
  - [x] Build Admin Dashboard UI: listing submissions table, filtering/search, detail view, approve/decline actions (with decline message).

- [ ] Listing submission flow  
  - [ ] Ensure new listings are stored as “pending” with submitter info.  
  - [ ] Add Firestore security rules to allow only admins to approve/decline and only owners to view their own pending/approved listings.

- [ ] Notifications model  
  - [ ] Define/extend `notifications` collection schema (type, userId, payload, read/unread, createdAt).  
  - [ ] Add “web notification preferences” per user (opt-in/out for listing decisions, bookings, payouts).

- [ ] Email notification opt-in  
  - [ ] Add user profile prefs for email notifications.  
  - [ ] Build functions to send email for: listing submitted (to admin), listing approved/declined (to lister, with feedback on decline), booking payout updates.  
  - [ ] Add a simple UI toggle in user settings for email/web notifications.

- [ ] Admin actions backend  
  - [ ] Create callable HTTPS functions:  
    - [ ] `approveListing(listingId, adminId, message?)`  
    - [ ] `declineListing(listingId, adminId, reason)`  
  - [ ] Each updates listing status, writes notifications for admin/lister, triggers email if opted in.  
  - [ ] Add Firestore triggers (or within callables) to ensure atomic status + notification writes.

- [ ] Revenue tracking per lister  
  - [ ] Schema: per-lister earnings aggregate (e.g., `lister_earnings` doc) and per-booking ledger entries (gross, platform_fee, lenco_fee, net).  
  - [ ] On booking completion: compute platform deduction (from env %) and lenco service charge (from constants tiers), store ledger entry, update lister’s available balance.  
  - [ ] UI: Lister earnings page showing total earned, available balance, fees breakdown per booking, and summary cards.

- [ ] Withdrawal flow  
  - [ ] UI: withdrawal screen showing available balance, platform deductions already applied, and lenco fee for the chosen amount; highlight “you’ll receive X, fees Y”.  
  - [ ] Backend callable: `initiateWithdrawal(listerId, amount)` that validates balance, applies fees, records withdrawal request, calls Lenco payout API, and updates balance/ledger.  
  - [ ] Add webhook/polling handler for Lenco payout status to update withdrawal record and notify user.

- [ ] Constants & env  
  - [ ] Add env for platform fee percentage (e.g., `PLATFORM_FEE_PERCENT`).  
  - [ ] Add Lenco fee tiers in a constants file.  
  - [ ] Verify LENCO API keys already in env; add any needed payout endpoints configuration.

- [ ] Notifications delivery  
  - [ ] Web: ensure notifications are created on all key events (submission received, approval, decline, withdrawal initiated/completed/failed).  
  - [ ] Email: respect user opt-in; reuse existing email sender or add a mail provider config.

- [ ] Frontend wiring  
  - [ ] Admin dashboard actions call new callables; optimistic updates and toasts.  
  - [ ] Lister dashboard shows notifications, earnings, withdrawals, balances; consistent UI styling with existing components.

- [ ] Security & rules  
  - [ ] Update Firestore rules to enforce:  
    - [ ] Only admins can approve/decline listings.  
    - [ ] Users can read/write only their own notifications and earnings/withdrawal records.  
  - [ ] Protect callables with auth checks and role checks.

- [ ] Testing & verification  
  - [ ] Add function tests for approve/decline, earnings calc, withdrawal, fee computation.  
  - [ ] Manual test scripts for Lenco API calls in emulator/stub mode if available.  
  - [ ] Check CORS for new callables via emulator curl/Invoke-WebRequest.

- [ ] Docs  
  - [ ] Update README with new env vars, emulator steps for new functions, and brief usage notes for admin/lister flows.
