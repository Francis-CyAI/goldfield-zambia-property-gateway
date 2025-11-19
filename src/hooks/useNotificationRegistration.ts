import { useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";
import { functions } from "@/lib/constants/firebase";
import { requestFcmToken, onForegroundNotification } from "@/lib/firebaseMessaging";
import { useAuth } from "@/contexts/AuthContext";

const saveTokenCallable = httpsCallable(functions, "saveUserMessagingToken");

export const useNotificationRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const setup = async () => {
      unsubscribe = await onForegroundNotification((payload) => {
        const title = payload.notification?.title ?? "New notification";
        const description = payload.notification?.body ?? payload.data?.message ?? "";
        toast({ title, description });
      });
    };
    setup();
    return () => {
      unsubscribe?.();
    };
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const registerToken = async () => {
      try {
        const token = await requestFcmToken();
        if (!token || cancelled) {
          return;
        }
        await saveTokenCallable({ token, platform: "web" });
      } catch (error) {
        console.warn("FCM token registration failed", error);
      }
    };

    registerToken();

    return () => {
      cancelled = true;
    };
  }, [user]);
};

export default useNotificationRegistration;
