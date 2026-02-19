import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getStripeAccount,
  getStripeOnboarding,
  getStripeDashboard,
  type StripeAccountStatus,
} from "@/lib/actions/payment";
import { queryKeys } from "@/lib/react-query/keys";

// --- Query: Fetch Stripe account status ---

export function useStripeAccount() {
  return useQuery<StripeAccountStatus>({
    queryKey: queryKeys.vendor.stripeAccount(),
    queryFn: async () => {
      const result = await getStripeAccount();
      if (!result.success) throw new Error(result.error || "Failed to fetch Stripe account");
      return result.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// --- Mutation: Get Stripe onboarding link ---

export function useStripeOnboarding() {
  return useMutation({
    mutationFn: async () => {
      const result = await getStripeOnboarding();
      if (!result.success) throw new Error(result.error || "Failed to get onboarding link");
      return result.data!;
    },
  });
}

// --- Mutation: Get Stripe dashboard link ---

export function useStripeDashboard() {
  return useMutation({
    mutationFn: async () => {
      const result = await getStripeDashboard();
      if (!result.success) throw new Error(result.error || "Failed to get dashboard link");
      return result.data!;
    },
  });
}
