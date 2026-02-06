"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVendorSpecialties } from "@/lib/actions/vendor-specialties";

interface UseVendorSpecialtiesOptions {
  page?: number;
  limit?: number;
  vendorId?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch vendor specialties
 */
export function useVendorSpecialties({
  page = 1,
  limit = 10,
  vendorId,
  enabled = true,
}: UseVendorSpecialtiesOptions = {}) {
  return useQuery({
    queryKey: ["vendor-specialties", page, limit, vendorId],
    queryFn: async () => {
      const result = await fetchVendorSpecialties(page, limit, vendorId);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch vendor specialties");
      }
      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
