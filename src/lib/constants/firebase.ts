// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  collection,
  CollectionReference,
  DocumentData,
  FirestoreDataConverter,
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import {
  type BaseDocument,
  type CollectionKey,
  type CollectionRecord,
  type CollectionRecordMap,
} from "@/lib/models";

const requireEnv = (value: string | undefined, key: string): string => {
  if (value == null || value === "") {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: requireEnv(import.meta.env.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv(import.meta.env.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const EMULATOR_COOKIE_KEY = "__FIREBASE_DEFAULTS__";
const firebaseRegion = import.meta.env.VITE_FIREBASE_REGION ?? "africa-south1";

const clearEmulatorOverrides = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const globalScope = globalThis as { __FIREBASE_DEFAULTS__?: unknown };
  if (globalScope.__FIREBASE_DEFAULTS__ != null) {
    delete globalScope.__FIREBASE_DEFAULTS__;
  }

  if (typeof document !== "undefined") {
    document.cookie = `${EMULATOR_COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

clearEmulatorOverrides();

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, firebaseRegion);
export const googleProvider = new GoogleAuthProvider();

// Emulator flags (supports granular toggles and a legacy single flag)
const legacyEmulatorFlag = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";
const useFirestoreEmulator = legacyEmulatorFlag || (import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === "true");
const useAuthEmulator = legacyEmulatorFlag || (import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_EMULATOR === "true");
const useFunctionsEmulator = legacyEmulatorFlag || (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true");

if (typeof window !== "undefined") {
  const globalScope = globalThis as { __FIREBASE_EMULATORS_ENABLED__?: boolean };
  if (!globalScope.__FIREBASE_EMULATORS_ENABLED__) {
    if (useFirestoreEmulator) {
      connectFirestoreEmulator(db, "localhost", 8080);
    }
    if (useAuthEmulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }
    if (useFunctionsEmulator) {
      connectFunctionsEmulator(functions, "localhost", 5001);
    }
    // Mark emulators as enabled to avoid repeated connections in HMR
    globalScope.__FIREBASE_EMULATORS_ENABLED__ = true;
  }
}

export const COLLECTIONS = {
  profiles: "profiles",
  properties: "properties",
  propertyAvailability: "property_availability",
  propertyLocations: "property_locations",
  propertyViews: "property_views",
  bookings: "bookings",
  bookingRequests: "booking_requests",
  platformCommissions: "platform_commissions",
  notifications: "notifications",
  messages: "messages",
  savedSearches: "saved_searches",
  reviews: "reviews",
  subscriptionTiers: "subscription_tiers",
  userSubscriptions: "user_subscriptions",
  partnerSubscriptionTiers: "partner_subscription_tiers",
  partnerSubscriptions: "partner_subscriptions",
  branches: "branches",
  adminUsers: "admin_users",
  adminActivityLogs: "admin_activity_logs",
  subscriptionPayments: "subscription_payments",
  partnerPayments: "partner_payments",
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
export type CollectionPath = typeof COLLECTIONS[CollectionName];

const createConverter = <T extends BaseDocument>(): FirestoreDataConverter<T> => ({
  toFirestore: ({ id, ...rest }: T) => rest as DocumentData,
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options) as DocumentData;
    return {
      id: snapshot.id,
      ...data,
    } as T;
  },
});

const converters: { [K in CollectionKey]: FirestoreDataConverter<CollectionRecordMap[K]> } = {
  profiles: createConverter(),
  properties: createConverter(),
  propertyAvailability: createConverter(),
  propertyLocations: createConverter(),
  propertyViews: createConverter(),
  bookings: createConverter(),
  bookingRequests: createConverter(),
  platformCommissions: createConverter(),
  notifications: createConverter(),
  messages: createConverter(),
  savedSearches: createConverter(),
  reviews: createConverter(),
  subscriptionTiers: createConverter(),
  userSubscriptions: createConverter(),
  partnerSubscriptionTiers: createConverter(),
  partnerSubscriptions: createConverter(),
  branches: createConverter(),
  adminUsers: createConverter(),
  adminActivityLogs: createConverter(),
  subscriptionPayments: createConverter(),
  partnerPayments: createConverter(),
};

export const getCollectionRef = <K extends CollectionKey>(key: K): CollectionReference<CollectionRecordMap[K]> =>
  collection(db, COLLECTIONS[key]).withConverter(
    converters[key] as FirestoreDataConverter<CollectionRecordMap[K]>,
  );
