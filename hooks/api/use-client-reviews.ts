import { useQuery } from "@tanstack/react-query";
import { getClientReviews } from "@/lib/actions/reviews";
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
