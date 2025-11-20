import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/constants/firebase";
import { useToast } from "@/hooks/use-toast";

const initiateWithdrawalCallable = httpsCallable(functions, "initiateWithdrawal");

export const useInitiateWithdrawal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { amount: number; msisdn: string; operator: string }) => {
      const response = await initiateWithdrawalCallable(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lister-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["lister-earning-entries"] });
      queryClient.invalidateQueries({ queryKey: ["lister-withdrawals"] });
      toast({ title: "Withdrawal requested", description: "We'll notify you once it's processed." });
    },
    onError: (error: any) => {
      const description = error?.message ?? "Unable to initiate withdrawal.";
      toast({ title: "Withdrawal failed", description, variant: "destructive" });
      throw error;
    },
  });
};
