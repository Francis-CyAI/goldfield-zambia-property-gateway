import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from "firebase/messaging";
import { app } from "@/lib/constants/firebase";

let messagingPromise: Promise<Messaging | null> | null = null;

const getMessagingInstance = () => {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(app) : null))
      .catch(() => null);
  }
  return messagingPromise;
};

const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return undefined;
  }
  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (error) {
    console.warn("Service worker registration failed", error);
    return undefined;
  }
};

const ensureNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const requestFcmToken = async (): Promise<string | null> => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Missing VITE_FIREBASE_MESSAGING_VAPID_KEY – skipping FCM registration.");
    return null;
  }

  try {
    const registration = await registerServiceWorker();
    return await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  } catch (error) {
    console.warn("Failed to fetch FCM token", error);
    return null;
  }
};

export const onForegroundNotification = async (
  handler: (payload: MessagePayload) => void,
): Promise<() => void> => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, handler);
};
