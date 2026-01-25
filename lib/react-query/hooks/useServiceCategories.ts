"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchServiceCategories,
  fetchServiceSpecialtiesByCategory,
} from "@/lib/actions/service-categories";

/**
 * Hook to fetch all service categories
 * Cached for 1 hour with 2 hour cache time
 */
export function useServiceCategories() {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const result = await fetchServiceCategories(1, 50);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch categories");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours (formerly cacheTime)
    retry: 2,
  });
}

/**
 * Hook to fetch specialties for a specific category
 * Only fetches when categoryId is provided
 * Cached for 30 minutes
 */
export function useServiceSpecialties(categoryId: string | null) {
  return useQuery({
    queryKey: ["service-specialties", categoryId],
    queryFn: async () => {
      const result = await fetchServiceSpecialtiesByCategory(categoryId!);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch specialties");
      }
      return result.data;
    },
    enabled: !!categoryId, // Only fetch when category is selected
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
