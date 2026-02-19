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
  paymentModel: "upfront_payout" | "split_payout",
): Promise<PaymentActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/payment-model`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentModel }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("setPaymentModel failed:", err);
      return {
        success: false,
        error: err.message || "Failed to set payment model",
      };
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
 *
 * TODO: Re-integrate with real Stripe API when keys are available
 * Currently mocked to allow completing the vendor setup flow
 */
export async function createStripeAccount(): Promise<
  PaymentActionResponse<{ stripeAccountId: string }>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/stripe-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createStripeAccount failed:", err);
      return {
        success: false,
        error: err.message || "Failed to create Stripe account",
      };
    }

    const data = await res.json();

    // Validate response structure
    if (!data.data?.stripeAccountId) {
      console.warn("Stripe account created but ID missing in response", data);
    }

    return {
      success: true,
      data: { stripeAccountId: data.data?.stripeAccountId || "unknown_id" },
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
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const payload = {
      version: "v1",
      commissionType: "percentage",
      commissionAmount: 10,
      currency: "GBP",
    };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/commission-agreement/accept`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("acceptCommission failed:", err);
      return {
        success: false,
        error: err.message || "Failed to accept commission agreement",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("acceptCommission error:", error);
    return { success: false, error: "Failed to accept commission agreement" };
  }
}

/**
 * Get Vendor Stripe Account Status
 * GET /api/v1/vendors/{vendorId}/stripe-account
 */
export type StripeAccountStatus = {
  vendorId: string;
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export async function getStripeAccount(): Promise<
  PaymentActionResponse<StripeAccountStatus>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/stripe-account`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getStripeAccount failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch Stripe account status",
      };
    }

    const data = await res.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("getStripeAccount error:", error);
    return { success: false, error: "Failed to fetch Stripe account status" };
  }
}

/**
 * Get Stripe Onboarding Link
 * GET /api/v1/vendors/{vendorId}/stripe-onboarding
 */
export type StripeOnboardingLink = {
  vendorId: string;
  url: string;
  expiresAt: string;
  };

export async function getStripeOnboarding(): Promise<
  PaymentActionResponse<StripeOnboardingLink>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/stripe-onboarding`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getStripeOnboarding failed:", err);
      return {
        success: false,
        error: err.message || "Failed to get onboarding link",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getStripeOnboarding error:", error);
    return { success: false, error: "Failed to get onboarding link" };
  }
}

/**
 * Get Stripe Dashboard Link
 * GET /api/v1/vendors/{vendorId}/stripe-dashboard
 */
export async function getStripeDashboard(): Promise<
  PaymentActionResponse<{ url: string }>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/stripe-dashboard`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getStripeDashboard failed:", err);
      return {
        success: false,
        error: err.message || "Failed to get dashboard link",
      };
    }

    const data = await res.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("getStripeDashboard error:", error);
    return { success: false, error: "Failed to get dashboard link" };
  }
}

// ────────────────────────────────────────────────────────────
// Vendor Balance
// GET /api/v1/vendors/{vendorId}/balance
// ────────────────────────────────────────────────────────────

export type VendorBalance = {
  vendorId: string;
  available: number;
  pending: number;
  currency: string;
};

export async function getVendorBalance(): Promise<
  PaymentActionResponse<VendorBalance>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/balance`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getVendorBalance failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch balance",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getVendorBalance error:", error);
    return { success: false, error: "Failed to fetch balance" };
  }
}

// ────────────────────────────────────────────────────────────
// Vendor Earnings
// GET /api/v1/vendors/{vendorId}/earnings
// ────────────────────────────────────────────────────────────

export type EarningsEntry = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  created: number;
};

export type VendorEarnings = {
  vendorId: string;
  earnings: EarningsEntry[];
  total: number;
};

export async function getVendorEarnings(): Promise<
  PaymentActionResponse<VendorEarnings>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/earnings`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getVendorEarnings failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch earnings",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getVendorEarnings error:", error);
    return { success: false, error: "Failed to fetch earnings" };
  }
}

// ────────────────────────────────────────────────────────────
// Vendor Payouts
// GET /api/v1/vendors/{vendorId}/payouts
// ────────────────────────────────────────────────────────────

export type PayoutEntry = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: number;
};

export type VendorPayouts = {
  vendorId: string;
  payouts: PayoutEntry[];
};

export async function getVendorPayouts(): Promise<
  PaymentActionResponse<VendorPayouts>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/payouts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getVendorPayouts failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch payouts",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getVendorPayouts error:", error);
    return { success: false, error: "Failed to fetch payouts" };
  }
}

// ────────────────────────────────────────────────────────────
// Vendor Payment Methods
// GET /api/v1/vendors/{vendorId}/payment-methods
// ────────────────────────────────────────────────────────────

export type VendorPaymentMethod = {
  id: string;
  object: string;
  bank_name: string;
  last4: string;
  routing_number: string;
  status: string;
  currency: string;
  account_holder_name?: string;
  account_holder_type?: string;
};

export type VendorPaymentMethodsResponse = {
  vendorId: string;
  stripeAccountId: string;
  paymentMethods: VendorPaymentMethod[];
};

export async function getVendorPaymentMethods(): Promise<
  PaymentActionResponse<VendorPaymentMethodsResponse>
> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    const vendorId = profileResult.data?.vendor?._id;
    if (!vendorId) return { success: false, error: "Vendor profile not found" };

    const accessToken = await getAccessToken();
    if (!accessToken)
      return { success: false, error: "Authentication required" };

    const res = await fetch(
      `${API_URL}/api/v1/vendors/${vendorId}/payment-methods`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("getVendorPaymentMethods failed:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch payment methods",
      };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("getVendorPaymentMethods error:", error);
    return { success: false, error: "Failed to fetch payment methods" };
  }
}
