"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface LocationState {
  lat: number | null;
  long: number | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    long: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser";
      setLocation((prev) => ({
        ...prev,
        error: errorMsg,
        loading: false,
      }));
      toast.error("Geolocation not supported", {
        description: errorMsg,
      });
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
        toast.success("Location set", {
          description: "We'll show vendors near you.",
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
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation({
      lat: null,
      long: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    ...location,
    requestLocation,
    clearLocation,
    setLocationState: setLocation, // Allow manual setting if needed (e.g. from URL)
  };
}
