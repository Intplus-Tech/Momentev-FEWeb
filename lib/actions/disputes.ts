"use server";

import { getAccessToken } from "@/lib/session";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DisputePayload = {
  bookingId: string;
  clientClaim: string;
  requestedRefundPercent: number;
  priority: "low" | "medium" | "high";
  clientAttachments?: string[];
};

export type DisputeResponse = {
  caseId: string;
  status: string;
  priority: string;
  amountInDisputeMinor: number;
  currency: string;
  filedAt: string;
  windowEndsAt: string;
  _id: string;
};

/**
 * Open a dispute for a booking payment.
 * POST /api/v1/disputes
 */
export async function createDispute(
  payload: DisputePayload
): Promise<ActionResponse<DisputeResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    const response = await fetch(`${API_URL}/api/v1/disputes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      
      // Handle validation errors from backend
      if (data.errors?.body?.fieldErrors) {
        const fieldErrors = data.errors.body.fieldErrors;
        const firstErrorKey = Object.keys(fieldErrors)[0];
        if (firstErrorKey && fieldErrors[firstErrorKey].length > 0) {
          return { success: false, error: `${firstErrorKey}: ${fieldErrors[firstErrorKey][0]}` };
        }
      }

      return { 
        success: false, 
        error: data.message || `Failed to create dispute (${response.status})` 
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error creating dispute:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export type ClientDispute = {
  _id: string;
  caseId: string;
  status: string;
  priority: string;
  amountInDisputeMinor: number;
  currency: string;
  filedAt: string;
  windowEndsAt: string;
  client: {
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    nameSnapshot: string;
    memberSince: string;
    previousDisputes: number;
  };
  vendor: {
    vendorId: {
      _id: string;
      userId: string;
      businessProfile: string;
      reviewCount: number;
    };
    nameSnapshot: string;
    ratingSnapshot: number;
    previousDisputes: number;
  };
  booking: {
    bookingId: {
      _id: string;
      vendorId: string;
      customerId: string;
      eventDetails?: {
        title: string;
        startDate: string;
        endDate: string;
        guestCount?: number;
        description?: string;
      };
      location?: {
        addressText: string;
      };
      currency: string;
      amounts?: {
        subtotal: number;
        fees: number;
        commission: number;
        total: number;
      };
      paymentModel: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    dateSnapshot: string;
    locationSnapshot: string;
    paymentModelSnapshot: string;
  };
  reason: {
    clientClaim: string;
    requestedRefundPercent: number;
    currency: string;
    clientAttachments: string[];
    vendorAttachments: string[];
  };
  timeline: {
    type: string;
    note: string;
    actorUserId: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedDisputes = {
  data: ClientDispute[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Fetch paginated list of disputes for the authenticated client.
 * GET /api/v1/disputes/me
 */
export async function getClientDisputes(
  page: number = 1,
  limit: number = 10,
  status: string = "all"
): Promise<ActionResponse<PaginatedDisputes>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== "all") {
      queryParams.append("status", status);
    }

    const response = await fetch(`${API_URL}/api/v1/disputes/me?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store", // Prevent caching so we get fresh data
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      return { 
        success: false, 
        error: data.message || `Failed to fetch disputes (${response.status})` 
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error fetching disputes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Cancel a dispute created by the authenticated client.
 * PATCH /api/v1/disputes/{disputeId}/cancel
 */
export async function cancelDispute(
  disputeId: string
): Promise<ActionResponse<void>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Authentication required" };

    const response = await fetch(`${API_URL}/api/v1/disputes/${disputeId}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      return { 
        success: false, 
        error: data.message || `Failed to cancel dispute (${response.status})` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error cancelling dispute:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
