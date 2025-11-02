// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  subscriptionTiers: "subscription_tiers",
  userSubscriptions: "user_subscriptions",
  partnerSubscriptionTiers: "partner_subscription_tiers",
  partnerSubscriptions: "partner_subscriptions",
  branches: "branches",
  adminUsers: "admin_users",
  adminActivityLogs: "admin_activity_logs",
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
export type CollectionPath = typeof COLLECTIONS[CollectionName];
