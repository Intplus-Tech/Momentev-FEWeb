import { useQuery } from "@tanstack/react-query";
import { getStripeCountries, type StripeCountry } from "@/lib/actions/payment";
import { queryKeys } from "@/lib/react-query/keys";

export function useStripeCountries() {
  return useQuery<StripeCountry[]>({
    queryKey: queryKeys.config.stripeCountries(),
    queryFn: async () => {
      const result = await getStripeCountries();
      if (!result.success) throw new Error(result.error || "Failed to fetch countries");
      return result.data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
