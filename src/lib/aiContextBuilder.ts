import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/constants/firebase";

export type AiContextPayload = {
  schemaText: string;
  contextData: Record<string, unknown>;
  debug?: Record<string, unknown>;
};

const SCHEMA_SUMMARY = `
Collections:
- profiles: { id, email, first_name, last_name, role }
- properties: { id, host_id, title, location, approval_status, is_active, price_per_night, max_guests }
- bookings: { id, property_id, host_id, guest_id, check_in, check_out, status, total_price, cancellation_reason? }
- listerEarnings: { user_id, total_gross, total_platform_fee, total_lenco_fee, available_balance, currency }
- listerEarningEntries: { id, booking_id, host_id, net_amount, platform_fee, lenco_fee, status, earned_at }
- listerWithdrawals: { id, user_id, amount_requested, lenco_fee, total_deducted, status, created_at }
Relationships:
- bookings.property_id -> properties.id
- bookings.host_id/guest_id -> profiles.id
- listerEarningEntries.booking_id -> bookings.id
- listerWithdrawals.user_id -> profiles.id
`;

const toPlain = (snapshot: any) => {
  if (!snapshot) return null;
  if ("id" in snapshot) {
    // Already plain
    return snapshot;
  }
  if ("exists" in snapshot && !snapshot.exists()) return null;
  const data = snapshot.data();
  return data ? { id: snapshot.id, ...data } : null;
};

const mapDocs = (snap: any, maxFields?: number) =>
  snap.docs.map((d: any) => {
    const data = d.data();
    const plain = { id: d.id, ...data };
    if (!maxFields) return plain;
    // If requested, trim to the first N keys for safety.
    const entries = Object.entries(plain).slice(0, maxFields);
    return Object.fromEntries(entries);
  });

export const buildAiContext = async (userId: string): Promise<AiContextPayload> => {
  // Profile
  const profileSnap = await getDoc(doc(db, COLLECTIONS.profiles, userId));
  const profile = toPlain(profileSnap);

  // Properties (host-owned)
  const propertiesSnap = await getDocs(
    query(collection(db, COLLECTIONS.properties), where("host_id", "==", userId), limit(5)),
  );
  const properties = mapDocs(propertiesSnap);

  // Bookings (as host)
  const bookingsSnap = await getDocs(
    query(collection(db, COLLECTIONS.bookings), where("host_id", "==", userId), limit(8)),
  );
  const bookings = mapDocs(bookingsSnap);

  // Earnings summary
  const earningsSnap = await getDoc(doc(db, COLLECTIONS.listerEarnings, userId));
  const earnings = toPlain(earningsSnap);

  // Earnings entries
  const earningEntriesSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.listerEarningEntries),
      where("host_id", "==", userId),
      limit(10),
    ),
  );
  const earningEntries = mapDocs(earningEntriesSnap);

  // Withdrawals
  const withdrawalsSnap = await getDocs(
    query(collection(db, COLLECTIONS.listerWithdrawals), where("user_id", "==", userId), limit(5)),
  );
  const withdrawals = mapDocs(withdrawalsSnap);

  const contextData = {
    profile,
    properties,
    bookings,
    earnings,
    earningEntries,
    withdrawals,
    generated_at: new Date().toISOString(),
  };

  return {
    schemaText: SCHEMA_SUMMARY.trim(),
    contextData,
    debug: {
      propertyCount: properties.length,
      bookingCount: bookings.length,
      earningEntryCount: earningEntries.length,
      withdrawalCount: withdrawals.length,
    },
  };
};
