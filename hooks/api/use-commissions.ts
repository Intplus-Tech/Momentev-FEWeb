"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCommissions } from "@/lib/actions/commissions";

export function useCommissions() {
  return useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const result = await fetchCommissions();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch commissions");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
}