import { useQuery } from "@tanstack/react-query";
import { fetchCustomerRequests, fetchCustomerRequestById } from "@/lib/actions/custom-request";
import type { CustomerRequestFilters } from "@/types/custom-request";

export function useCustomerRequests(
  page = 1,
  limit = 10,
  filters?: CustomerRequestFilters
) {
  return useQuery({
    queryKey: ["customer-requests", page, limit, filters],
    queryFn: async () => {
      console.log("[useCustomerRequests] queryFn called", { page, limit, filters });
      const result = await fetchCustomerRequests(page, limit, filters);
      console.log("[useCustomerRequests] result:", { success: result.success, error: result.error });
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch customer requests");
      }
      return result.data;
    },
    retry: 2,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCustomerRequest(id: string | null) {
  return useQuery({
    queryKey: ["customer-request", id],
    queryFn: async () => {
      if (!id) throw new Error("No request ID provided");
      console.log("[useCustomerRequest] queryFn called for id:", id);
      const result = await fetchCustomerRequestById(id);
      console.log("[useCustomerRequest] result:", { success: result.success, error: result.error });
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch customer request");
      }
      return result.data;
    },
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

