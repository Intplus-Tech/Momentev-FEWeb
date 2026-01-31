"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchServiceSpecialtyById } from "@/lib/actions/service-specialties";

/**
 * Hook to fetch a single service specialty by ID
 */
export function useServiceSpecialty(id: string | null | undefined) {
  return useQuery({
    queryKey: ["service-specialty", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await fetchServiceSpecialtyById(id);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch service specialty");
      }
      return result.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });
}

/**
 * Hook to fetch multiple service specialties by IDs
 */
export function useServiceSpecialtiesNames(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["service-specialty", id],
      queryFn: async () => {
        const result = await fetchServiceSpecialtyById(id);
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch service specialty");
        }
        return result.data.data.name;
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  });
}
