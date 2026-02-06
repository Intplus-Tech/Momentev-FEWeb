"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getVendorsAction, getNearbyVendorsAction, getVendorDetailsAction } from "@/app/(home)/search/_data/actions";
import { SearchFilters } from "@/app/(home)/search/_data/types";
import { toast } from "sonner";

// Unified hook for fetching vendors (Search OR Nearby)
export const useVendors = (
  filters: SearchFilters,
  location?: { lat: number | null; long: number | null; radius: number }
) => {
  const isNearby = !!(location?.lat && location?.long && filters.sort === "distance");

  return useQuery({
    queryKey: ["vendors", isNearby ? "nearby" : "search", filters, location],
    queryFn: () => {
      if (isNearby) {
        return getNearbyVendorsAction({
          ...filters,
          lat: location!.lat!,
          long: location!.long!,
          maxDistanceKm: location!.radius,
        });
      }
      return getVendorsAction(filters);
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};


// Hook for fetching vendor details by ID
export const useVendorDetails = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendor", "details", vendorId],
    queryFn: () => {
      if (!vendorId) throw new Error("Vendor ID required");
      return getVendorDetailsAction(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching vendor services (categories, tags)
export const useVendorServices = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendor", "services", vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error("Vendor ID required");
      const { getVendorServicesAction } = await import("@/app/(home)/search/_data/actions");
      return getVendorServicesAction(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching vendor specialties (pricing, descriptions)
export const useVendorSpecialties = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendor", "specialties", vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error("Vendor ID required");
      const { getVendorSpecialtiesAction } = await import("@/app/(home)/search/_data/actions");
      return getVendorSpecialtiesAction(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching vendor reviews
export const useVendorReviews = (vendorId: string | null, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["vendor", "reviews", vendorId, page, limit],
    queryFn: async () => {
      if (!vendorId) throw new Error("Vendor ID required");
      const { getVendorReviewsAction } = await import("@/app/(home)/search/_data/actions");
      return getVendorReviewsAction(vendorId, page, limit);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
