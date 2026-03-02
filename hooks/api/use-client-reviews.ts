import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientReviews, createReview } from "@/lib/actions/reviews";
import { queryKeys } from "@/lib/react-query/keys";

export function useClientReviews(customerId: string | undefined, page = 1) {
  return useQuery({
    queryKey: customerId ? queryKeys.reviews.byCustomer(customerId) : [],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      const result = await getClientReviews(customerId, page);
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
      rating: number; 
      comment: string;
      user?: { _id: string; firstName: string; lastName: string };
    }) => {
      const result = await createReview({
        vendorId: data.vendorId,
        rating: data.rating,
        comment: data.comment,
      });
      if (!result.success) {
        throw new Error(result.error);
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
    },
  });
}
