import { getApp, getApps, initializeApp } from "firebase-admin/app";

// Ensure we can initialize even if FIREBASE_CONFIG isn't injected (e.g., manifest scan in emulator)
const ensureFirebaseConfig = () => {
  if (process.env.FIREBASE_CONFIG) {
    // Already set; nothing to do.
    return;
  }

  let projectId = process.env.GCLOUD_PROJECT || "goldfield-8180d";

  // If FIREBASE_CONFIG was set to a stringified JSON elsewhere, prefer its projectId
  if (typeof process.env.FIREBASE_CONFIG === "string") {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_CONFIG);
      projectId = parsed?.projectId || projectId;
    } catch {
      // ignore parse errors and fall back
    }
  }

  process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
};

ensureFirebaseConfig();

export const app = getApps().length === 0 ? initializeApp() : getApp();
