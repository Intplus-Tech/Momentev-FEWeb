"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ────────────────────────────────────────────────────────────
// Customer Payment Method Types
// ────────────────────────────────────────────────────────────

export interface CustomerPaymentMethod {
  id: string;
  object: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  type: string;
  created: number;
}

export interface CustomerPaymentMethodsResponse {
  customerId: string;
  paymentMethods: CustomerPaymentMethod[];
}

// ────────────────────────────────────────────────────────────
// Get Customer Payment Methods
// GET /api/v1/customers/{customerId}/payment-methods
// ────────────────────────────────────────────────────────────

export async function getCustomerPaymentMethods(): Promise<
  ActionResponse<CustomerPaymentMethodsResponse>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const customerId = profileResult.data?._id;
    if (!customerId)
      return { success: false, error: "Customer profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/customers/${customerId}/payment-methods`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getCustomerPaymentMethods failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch payment methods",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getCustomerPaymentMethods error:", error);
    return { success: false, error: "Failed to fetch payment methods" };
  }
}

// ────────────────────────────────────────────────────────────
// Add Customer Payment Method
// POST /api/v1/customers/{customerId}/payment-methods
// ────────────────────────────────────────────────────────────

export async function addCustomerPaymentMethod(
  paymentMethodId: string
): Promise<ActionResponse<{ customerId: string; paymentMethodId: string }>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const customerId = profileResult.data?._id;
    if (!customerId)
      return { success: false, error: "Customer profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/customers/${customerId}/payment-methods`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentMethodId }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("addCustomerPaymentMethod failed:", err);
      return {
        success: false,
        error: err.message || "Failed to add payment method",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("addCustomerPaymentMethod error:", error);
    return { success: false, error: "Failed to add payment method" };
  }
}

// ────────────────────────────────────────────────────────────
// Set Default Payment Method
// PUT /api/v1/customers/{customerId}/payment-methods/{paymentMethodId}/default
// ────────────────────────────────────────────────────────────

export async function setDefaultPaymentMethod(
  paymentMethodId: string
): Promise<ActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const customerId = profileResult.data?._id;
    if (!customerId)
      return { success: false, error: "Customer profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/customers/${customerId}/payment-methods/${paymentMethodId}/default`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("setDefaultPaymentMethod failed:", err);
      return {
        success: false,
        error: err.message || "Failed to set default payment method",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("setDefaultPaymentMethod error:", error);
    return { success: false, error: "Failed to set default payment method" };
  }
}
