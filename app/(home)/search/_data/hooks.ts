"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getVendorsAction, getNearbyVendorsAction } from "./actions";
import { SearchFilters } from "./types";
import { toast } from "sonner";

// Hook for standard search
export const useVendorSearch = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ["vendors", "search", filters],
    queryFn: () => getVendorsAction(filters),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for nearby search
export const useNearbyVendors = (
  lat: number | null,
  long: number | null,
  filters: Omit<SearchFilters, "sort"> & { maxDistanceKm?: number }
) => {
  return useQuery({
    queryKey: ["vendors", "nearby", { lat, long, ...filters }],
    queryFn: () => {
      if (!lat || !long) throw new Error("Location required");
      return getNearbyVendorsAction({
        lat,
        long,
        ...filters,
      });
    },
    enabled: !!lat && !!long,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// Hook for browser geolocation
export const useCurrentLocation = () => {
  const [location, setLocation] = useState<{
    lat: number | null;
    long: number | null;
    error: string | null;
    loading: boolean;
  }>({
    lat: null,
    long: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Failed to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please reset permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        toast.error("Location Error", { description: errorMessage });

        setLocation({
          lat: null,
          long: null,
          error: errorMessage,
          loading: false,
        });
      }
    );
  };

  return { ...location, requestLocation };
};
