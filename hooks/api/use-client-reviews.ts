import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClientReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/actions/reviews";
import { queryKeys } from "@/lib/react-query/keys";

export function useClientReviews(customerId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: customerId ? [...queryKeys.reviews.byCustomer(customerId), page, limit] : [],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      const result = await getClientReviews(customerId, page, limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!customerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vendorId: string;
      bookingId?: string;
      rating: number;
      comment: string;
      user?: { _id: string; firstName: string; lastName: string };
    }) => {
      const result = await createReview({
        vendorId: data.vendorId,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment,
      });
      if (!result.success) {
        const err: any = new Error(result.error);
        if ((result as any).restriction) err.restriction = (result as any).restriction;
        throw err;
      }
      return result.data;
    },
    onMutate: async (newReviewData) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      const queryKey = ["vendor", "reviews", newReviewData.vendorId, 1, 10];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.data || !old.data.data) return old;

        // Create a fake review object matching the API response structure
        const optimisticReview = {
          _id: `temp-${Date.now()}`,
          vendorId: newReviewData.vendorId,
          bookingId: newReviewData.bookingId,
          reviewer: newReviewData.user ? {
            _id: newReviewData.user._id,
            firstName: newReviewData.user.firstName,
            lastName: newReviewData.user.lastName,
          } : {
            firstName: "You",
            lastName: "",
          },
          rating: newReviewData.rating,
          comment: newReviewData.comment,
          isEdited: false,
          isFlagged: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          data: {
            ...old.data,
            data: [optimisticReview, ...old.data.data],
            total: (old.data.total || 0) + 1,
          }
        };
      });

      // Return a context object with the snapshotted value
      return { previousReviews, queryKey };
    },
    onError: (err, newReviewData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReviews) {
        queryClient.setQueryData(context.queryKey, context.previousReviews);
      }
    },
    onSettled: (_, error, variables, context) => {
      // Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      if (variables?.vendorId) {
        queryClient.invalidateQueries({ queryKey: ["vendor", "reviews", variables.vendorId] });
        queryClient.invalidateQueries({ queryKey: ["vendor", "details", variables.vendorId] });
      }

      // If a bookingId was provided, invalidate booking detail and list to update unified inbox/booking state
      if (variables?.bookingId) {
        try {
          queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });
        } catch { }
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      }

      // Invalidate notifications so in-app prompts reflect review state
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reviewId: string; rating?: number; comment?: string; vendorId?: string; bookingId?: string }) => {
      const result = await updateReview(data.reviewId, {
        rating: data.rating,
        comment: data.comment,
      });
      if (!result.success) {
        const err: any = new Error(result.error);
        if ((result as any).restriction) err.restriction = (result as any).restriction;
        throw err;
      }
      return result.data;
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      if (variables?.vendorId) {
        queryClient.invalidateQueries({ queryKey: ["vendor", "reviews", variables.vendorId] });
        queryClient.invalidateQueries({ queryKey: ["vendor", "details", variables.vendorId] });
      }
      if (variables?.bookingId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      }
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reviewId: string; vendorId?: string; bookingId?: string }) => {
      const result = await deleteReview(data.reviewId);
      if (!result.success) {
        const err: any = new Error(result.error);
        if ((result as any).restriction) err.restriction = (result as any).restriction;
        throw err;
      }
      return result.data;
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      if (variables?.vendorId) {
        queryClient.invalidateQueries({ queryKey: ["vendor", "reviews", variables.vendorId] });
        queryClient.invalidateQueries({ queryKey: ["vendor", "details", variables.vendorId] });
      }
      if (variables?.bookingId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      }
    },
  });
}
