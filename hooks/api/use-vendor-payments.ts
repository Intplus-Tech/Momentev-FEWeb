"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVendorBalance,
  getVendorEarnings,
  getVendorPayouts,
  getVendorPaymentMethods,
  type VendorBalance,
  type VendorEarnings,
  type VendorPayouts,
  type VendorPaymentMethodsResponse,
} from "@/lib/actions/payment";
import { queryKeys } from "@/lib/react-query/keys";

export function useVendorBalance() {
  return useQuery<VendorBalance>({
    queryKey: queryKeys.vendor.balance(),
    queryFn: async () => {
      const result = await getVendorBalance();
      if (!result.success) throw new Error(result.error || "Failed to fetch balance");
      return result.data!;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useVendorEarnings() {
  return useQuery<VendorEarnings>({
    queryKey: queryKeys.vendor.earnings(),
    queryFn: async () => {
      const result = await getVendorEarnings();
      if (!result.success) throw new Error(result.error || "Failed to fetch earnings");
      return result.data!;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useVendorPayouts() {
  return useQuery<VendorPayouts>({
    queryKey: queryKeys.vendor.payouts(),
    queryFn: async () => {
      const result = await getVendorPayouts();
      if (!result.success) throw new Error(result.error || "Failed to fetch payouts");
      return result.data!;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useVendorPaymentMethods() {
  return useQuery<VendorPaymentMethodsResponse>({
    queryKey: queryKeys.vendor.paymentMethods(),
    queryFn: async () => {
      const result = await getVendorPaymentMethods();
      if (!result.success) throw new Error(result.error || "Failed to fetch payment methods");
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
