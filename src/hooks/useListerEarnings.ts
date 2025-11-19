import { useQuery } from "@tanstack/react-query";
import { orderBy, where } from "firebase/firestore";
import { getDocument, listDocuments } from "@/lib/utils/firebase";
import type { ListerEarning, ListerEarningEntry } from "@/lib/models";

export const useListerEarnings = (userId?: string) => {
  return useQuery({
    queryKey: ["lister-earnings", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await getDocument("listerEarnings", userId);
      if (error) throw error;
      return (data as ListerEarning | null) ?? null;
    },
    enabled: !!userId,
  });
};

export const useListerEarningEntries = (userId?: string) => {
  return useQuery({
    queryKey: ["lister-earning-entries", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listDocuments("listerEarningEntries", [
        where("host_id", "==", userId),
        orderBy("earned_at", "desc"),
      ]);
      if (error) throw error;
      return (data as ListerEarningEntry[]) ?? [];
    },
    enabled: !!userId,
  });
};
