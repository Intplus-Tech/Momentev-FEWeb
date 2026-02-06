import { useQuery } from "@tanstack/react-query";
import { fetchCustomerRequests } from "@/lib/actions/custom-request";

export function useCustomerRequests(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["customer-requests", page, limit],
    queryFn: async () => {
      const result = await fetchCustomerRequests(page, limit);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch customer requests");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
