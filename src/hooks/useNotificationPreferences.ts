import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";
import { setDocument, getDocument } from "@/lib/utils/firebase";
import type { NotificationPreference } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";

export const useNotificationPreferences = (userId?: string) => {
  return useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await getDocument("notificationPreferences", userId);
      if (error) throw error;
      return (data as NotificationPreference | null) ?? null;
    },
    enabled: !!userId,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Omit<NotificationPreference, "id" | "user_id">>;
    }) => {
      const { error } = await setDocument(
        "notificationPreferences",
        userId,
        {
          user_id: userId,
          ...updates,
          updated_at: serverTimestamp(),
          created_at: serverTimestamp(),
        },
        { merge: true },
      );
      if (error) throw error;
      const { data } = await getDocument("notificationPreferences", userId);
      return data as NotificationPreference | null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", data?.user_id] });
      toast({ title: "Preferences saved", description: "Your notification settings were updated." });
    },
    onError: (error) => {
      console.error("Failed to update notification preferences", error);
      toast({
        title: "Unable to save preferences",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    },
  });
};

export default useNotificationPreferences;
