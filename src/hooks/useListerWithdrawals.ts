import { useQuery } from "@tanstack/react-query";
import { orderBy, where } from "firebase/firestore";
import { listDocuments } from "@/lib/utils/firebase";
import type { ListerWithdrawal } from "@/lib/models";

export const useListerWithdrawals = (userId?: string) => {
  return useQuery({
    queryKey: ["lister-withdrawals", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listDocuments("listerWithdrawals", [
        where("user_id", "==", userId),
        orderBy("created_at", "desc"),
      ]);
      if (error) throw error;
      return (data as ListerWithdrawal[]) ?? [];
    },
    enabled: !!userId,
  });
};

export default useListerWithdrawals;
