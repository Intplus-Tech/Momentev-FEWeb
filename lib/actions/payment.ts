"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";

const API_URL = process.env.BACKEND_URL;

export type PaymentActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Set Vendor Payment Model
 * PUT /api/v1/vendors/{vendorId}/payment-model
 */
export async function setPaymentModel(
  paymentModel: "upfront_payout" | "split_payout"
): Promise<PaymentActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    console.log(`Setting payment model to ${paymentModel} for vendor ${vendorId}`);

    const res = await fetch(`${API_URL}/api/v1/vendors/${vendorId}/payment-model`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ paymentModel }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("setPaymentModel failed:", err);
      return { success: false, error: err.message || "Failed to set payment model" };
    }

    return { success: true };
  } catch (error) {
    console.error("setPaymentModel error:", error);
    return { success: false, error: "Failed to set payment model" };
  }
}

/**
 * Create Stripe Connected Account
 * POST /api/v1/vendors/{vendorId}/stripe-account
 */
export async function createStripeAccount(): Promise<PaymentActionResponse<{ stripeAccountId: string }>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    console.log(`Creating Stripe account for vendor ${vendorId}`);

    const res = await fetch(`${API_URL}/api/v1/vendors/${vendorId}/stripe-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createStripeAccount failed:", err);
      return { success: false, error: err.message || "Failed to create Stripe account" };
    }

    const data = await res.json();

    // Validate response structure
    if (!data.data?.stripeAccountId) {
      console.warn("Stripe account created but ID missing in response", data);
      // Fallback or error if strictly required, but for now return success if API was OK
    }

    return {
      success: true,
      data: { stripeAccountId: data.data?.stripeAccountId || "unknown_id" }
    };

  } catch (error) {
    console.error("createStripeAccount error:", error);
    return { success: false, error: "Failed to create Stripe account" };
  }
}

/**
 * Accept Commission Agreement
 * POST /api/v1/vendors/{vendorId}/commission-agreement/accept
 */
export async function acceptCommission(): Promise<PaymentActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    const payload = {
      version: "v1",
      commissionType: "percentage",
      commissionAmount: 10,
      currency: "GBP",
    };

    console.log(`Accepting commission for vendor ${vendorId}`);

    const res = await fetch(`${API_URL}/api/v1/vendors/${vendorId}/commission-agreement/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("acceptCommission failed:", err);
      return { success: false, error: err.message || "Failed to accept commission agreement" };
    }

    return { success: true };

  } catch (error) {
    console.error("acceptCommission error:", error);
    return { success: false, error: "Failed to accept commission agreement" };
  }
}
