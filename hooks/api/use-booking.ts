"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  fetchBookings,
  fetchBookingById,
  cancelBooking,
} from "@/lib/actions/booking";
import { queryKeys } from "@/lib/react-query/keys";
import type {
  CreateBookingPayload,
  BookingResponse,
  BookingListResponse,
} from "@/types/booking";

/**
 * Hook to fetch bookings list
 */
export function useBookings(page = 1, limit = 10, enabled = true) {
  return useQuery<BookingListResponse>({
    queryKey: queryKeys.bookings.list(page, limit),
    queryFn: async () => {
      const result = await fetchBookings(page, limit);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch bookings");
      }
      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(bookingId: string, enabled = true) {
  return useQuery<BookingResponse>({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      const result = await fetchBookingById(bookingId);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch booking");
      }
      return result.data;
    },
    enabled: enabled && !!bookingId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const result = await createBooking(payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to create booking");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await cancelBooking(bookingId);
      if (!result.success) {
        throw new Error(result.error || "Failed to cancel booking");
      }
      return result.data;
    },
    onSuccess: (_, bookingId) => {
      // Invalidate the specific booking and the list
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
