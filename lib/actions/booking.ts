"use server";

import { fetchWithAuthRetry } from "@/lib/actions/auth-retry";
import { majorToMinor } from "@/lib/currency";
import { getAccessToken, tryRefreshToken } from "@/lib/session";
import { ensureClientAllowedToAct } from "@/lib/actions/utils";
import { ClientActionBlockedError } from "@/lib/actions/errors";
import type {
  CreateBookingPayload,
  BookingResponse,
  BookingListResponse,
  CreateUnifiedBookingInput,
  AdjustUnifiedBookingInput,
} from "@/types/booking";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

function normalizeBookingPayload(payload: CreateBookingPayload): CreateBookingPayload {
  return {
    ...payload,
    budgetAllocations: payload.budgetAllocations.map((allocation) => ({
      ...allocation,
      budgetedAmount: majorToMinor(allocation.budgetedAmount),
    })),
  };
}

function normalizeUnifiedBookingPayload(
  payload: CreateUnifiedBookingInput,
): CreateUnifiedBookingInput {
  return {
    ...payload,
    budget: payload.budget,
  };
}

function normalizeAdjustedBookingPayload(
  payload: AdjustUnifiedBookingInput,
): AdjustUnifiedBookingInput {
  return {
    ...payload,
    finalPrice: payload.finalPrice,
    extraLineItems: payload.extraLineItems,
  };
}

/**
 * Create a booking
 * POST /api/v1/bookings
 */
export async function createBooking(
  payload: CreateBookingPayload
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    try {
      await ensureClientAllowedToAct();
    } catch (err: any) {
      if (err?.name === 'ClientActionBlockedError') {
        return { success: false, error: err.restriction?.helpText || err.message, restriction: err.restriction } as any;
      }
      throw err;
    }
    const normalizedPayload = normalizeBookingPayload(payload);
    // console.log("[Booking] createBooking payload:", normalizedPayload);
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required. Please log in." };
    }

    const response = await fetch(`${API_URL}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(normalizedPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration with retry
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();

        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${API_URL}/api/v1/bookings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.token}`,
            },
            body: JSON.stringify(normalizedPayload),
          });

          const retryData = await retryResponse.json();
          // console.log("[Booking] createBooking response (retry):", retryData);


          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }

          return {
            success: false,
            error: retryData.message || "Failed to create booking after token refresh",
          };
        }

        return { success: false, error: "Session expired. Please log in again." };
      }

      // Handle validation errors
      if (response.status === 400) {
        const errorMessage = data.message || data.error || "Invalid booking data";
        return { success: false, error: errorMessage };
      }

      // Handle other errors
      return {
        success: false,
        error: data.message || `Failed to create booking (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ [Booking] Error creating booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Create a booking from an accepted quote
 * POST /api/v1/bookings/from-quote/{quoteId}
 */
export async function createBookingFromQuote(
  quoteId: string,
  location?: string
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    try {
      await ensureClientAllowedToAct();
    } catch (err: any) {
      if (err?.name === 'ClientActionBlockedError') {
        return { success: false, error: err.restriction?.helpText || err.message, restriction: err.restriction } as any;
      }
      throw err;
    }
    const body = location ? JSON.stringify({ location: { addressText: location } }) : undefined;

    const { response, error, errorCode } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/from-quote/${quoteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    const data = await response.json().catch(() => ({}));


    if (!response.ok) {
      if (response.status === 401) return { success: false, error: "Session expired" };
      return {
        success: false,
        error: data.message || `Failed to create booking from quote (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error creating booking from quote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch bookings for the current user (as customer)
 * GET /api/v1/bookings
 */
export async function fetchBookings(
  page = 1,
  limit = 10
): Promise<ActionResponse<BookingListResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings?page=${page}&limit=${limit}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }
    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Session expired" };
      }
      return {
        success: false,
        error: `Failed to fetch bookings: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch a single booking by ID
 * GET /api/v1/bookings/:id
 */
export async function fetchBookingById(
  bookingId: string
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/${bookingId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }
    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Session expired" };
      }
      if (response.status === 404) {
        return { success: false, error: "Booking not found" };
      }
      return {
        success: false,
        error: `Failed to fetch booking: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Cancel a booking
 * PATCH /api/v1/bookings/:id/cancel
 */
export async function cancelBooking(
  bookingId: string
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/v1/bookings/${bookingId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || `Failed to cancel booking (${response.status})`,
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch bookings for the authenticated vendor
 * GET /api/v1/bookings/vendor/me
 */
export async function fetchVendorBookings(
  page = 1,
  limit = 10
): Promise<ActionResponse<BookingListResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/vendor/me?page=${page}&limit=${limit}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }
    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Session expired" };
      }
      return {
        success: false,
        error: `Failed to fetch vendor bookings: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching vendor bookings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Vendor confirm or reject a booking
 * POST /api/v1/bookings/:id/vendor/decision
 */
export async function decideVendorBooking(
  bookingId: string,
  decision: "confirmed" | "rejected"
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/v1/bookings/${bookingId}/vendor/decision`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ decision }),
      }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // Need to handle error response safely
      const errorMsg = data.message || (data.errors?.body?.fieldErrors?.decision?.[0]) || `Failed to process decision (${response.status})`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error processing booking decision:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a unified booking request
 * POST /api/v1/bookings/unified
 */
export async function createUnifiedBooking(
  payload: CreateUnifiedBookingInput
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    try {
      await ensureClientAllowedToAct();
    } catch (err: any) {
      if (err?.name === 'ClientActionBlockedError') {
        return { success: false, error: err.restriction?.helpText || err.message };
      }
      throw err;
    }
    const normalizedPayload = normalizeUnifiedBookingPayload(payload);
    // console.log("[Booking] createUnifiedBooking payload:", normalizedPayload);
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/unified`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedPayload),
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    const data = await response.json().catch(() => ({}));
    // console.log("[Booking] createUnifiedBooking response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to create unified booking (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error creating unified booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Advance unified booking status
 * PATCH /api/v1/bookings/{bookingId}/unified-status
 */
export async function updateUnifiedBookingStatus(
  bookingId: string
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/${bookingId}/unified-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to update unified booking status (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error updating unified booking status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Adjust unified booking pricing
 * PUT /api/v1/bookings/{bookingId}/unified-adjust
 */
export async function adjustUnifiedBooking(
  bookingId: string,
  payload: AdjustUnifiedBookingInput
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const normalizedPayload = normalizeAdjustedBookingPayload(payload);
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/${bookingId}/unified-adjust`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedPayload),
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to adjust unified booking (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error adjusting unified booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send unified booking invoice
 * POST /api/v1/bookings/{bookingId}/unified-send-invoice
 */
export async function sendUnifiedBookingInvoice(
  bookingId: string
): Promise<ActionResponse<BookingResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const { response, error } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/bookings/${bookingId}/unified-send-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to send unified booking invoice (${response.status})`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("❌ Error sending unified booking invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
