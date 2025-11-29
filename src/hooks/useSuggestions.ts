import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderBy, serverTimestamp, where } from "firebase/firestore";
import { auth } from "@/lib/constants/firebase";
import type { Suggestion } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import { addDocument, listDocuments, setDocument } from "@/lib/utils/firebase";
import { removeUndefined } from "@/lib/utils/remove-undfined";

export const useSuggestions = (options?: { userId?: string; scope?: "admin" | "user" }) => {
  const scope = options?.scope ?? "user";
  return useQuery({
    queryKey: ["suggestions", scope, options?.userId],
    queryFn: async () => {
      if (scope === "user" && !options?.userId) return [];

      const constraints = [orderBy("created_at", "desc")];
      if (scope === "user" && options?.userId) {
        constraints.unshift(where("user_id", "==", options.userId));
      }

      const { data, error } = await listDocuments("suggestions", constraints);
      if (error) throw error;
      return (data as Suggestion[]) ?? [];
    },
    enabled: scope === "admin" ? true : !!options?.userId,
  });
};

export const useSubmitSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      message: string;
      type: Suggestion["type"];
      category?: Suggestion["category"];
      priority?: Suggestion["priority"];
      contact_email?: string;
      contact_phone?: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You need to sign in to submit feedback.");
      }

      const { data, error } = await addDocument("suggestions", removeUndefined({
        ...payload,
        user_id: currentUser.uid,
        contact_email: payload.contact_email ?? currentUser.email ?? null,
        contact_phone: payload.contact_phone ?? null,
        status: "new" as Suggestion["status"],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }));

      if (error) throw error;
      return data as Suggestion;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast({
        title: "Feedback submitted",
        description: "Thanks for your suggestion. Our team will review it soon.",
      });
      return variables;
    },
    onError: (error: any) => {
      const description = error?.message ?? "Unable to submit your feedback right now.";
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      });
      throw error;
    },
  });
};

export const useUpdateSuggestionStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      suggestionId: string;
      status: Suggestion["status"];
      resolution_notes?: string | null;
    }) => {
      const { error } = await setDocument(
        "suggestions",
        payload.suggestionId,
        removeUndefined({
          status: payload.status,
          resolution_notes: payload.resolution_notes ?? null,
          updated_at: serverTimestamp(),
        }),
        { merge: true },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast({
        title: "Suggestion updated",
        description: "Status changed successfully.",
      });
    },
    onError: (error: any) => {
      const description = error?.message ?? "Unable to update this suggestion.";
      toast({
        title: "Update failed",
        description,
        variant: "destructive",
      });
      throw error;
    },
  });
};
