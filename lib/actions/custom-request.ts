"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";
import {
  CustomRequestPayload,
  DraftUpdatePayload,
  CustomerRequestListResponse,
  CustomerRequest,
  CustomerRequestFilters,
} from "@/types/custom-request";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Helper to make authenticated requests with token refresh
 */
async function makeAuthenticatedRequest<T>(
  url: string,
  options: RequestInit
): Promise<ActionResponse<T>> {
  const startTime = Date.now();
  console.log(`[makeAuthenticatedRequest] START ${options.method || "GET"} ${url}`);

  const token = await getAccessToken();
  console.log(`[makeAuthenticatedRequest] Token obtained: ${token ? 'yes' : 'NO TOKEN'} (${Date.now() - startTime}ms)`);

  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log(`[makeAuthenticatedRequest] Response Status: ${response.status} (${Date.now() - startTime}ms)`);

    const text = await response.text();
    console.log(`[makeAuthenticatedRequest] Body length: ${text.length} chars`);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[makeAuthenticatedRequest] Failed to parse JSON:", text.substring(0, 200));
      return { success: false, error: "Invalid JSON response from server" };
    }

    if (!response.ok) {
      console.error("[makeAuthenticatedRequest] Error:", response.status, data.message || JSON.stringify(data).substring(0, 200));

      if (response.status === 401) {
        console.log("[makeAuthenticatedRequest] Attempting token refresh...");
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          console.log("[makeAuthenticatedRequest] Token refreshed, retrying...");
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.token}`,
              ...options.headers,
            },
          });

          const retryText = await retryResponse.text();
          console.log(`[makeAuthenticatedRequest] Retry Status: ${retryResponse.status} (${Date.now() - startTime}ms)`);

          let retryData;
          try {
            retryData = JSON.parse(retryText);
          } catch (e) {
            return { success: false, error: "Invalid JSON response on retry" };
          }

          if (retryResponse.ok) {
            console.log(`[makeAuthenticatedRequest] Retry SUCCESS (${Date.now() - startTime}ms)`);
            return { success: true, data: retryData.data };
          }
          console.error("[makeAuthenticatedRequest] Retry Failed:", retryData.message);
          return { success: false, error: retryData.message || "Request failed after token refresh" };
        }
        console.error("[makeAuthenticatedRequest] Token refresh failed");
      }
      return { success: false, error: data.message || "Request failed" };
    }

    console.log(`[makeAuthenticatedRequest] SUCCESS (${Date.now() - startTime}ms)`);
    return { success: true, data: data.data };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[makeAuthenticatedRequest] TIMEOUT after 15s for ${url}`);
      return { success: false, error: "Request timed out" };
    }
    console.error(`[makeAuthenticatedRequest] FETCH ERROR:`, error);
    return { success: false, error: error.message || "Network error" };
  }
}

/**
 * Submit a custom request (regular submit)
 * POST /api/v1/customer-requests/submit
 */
export async function submitCustomRequest(
  payload: CustomRequestPayload
): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data) {
      return { success: false, error: "Failed to fetch user profile for customer ID" };
    }

    const finalPayload = {
      ...payload,
      customerId: profileResult.data._id,
    };

    console.log("[submitCustomRequest] Payload:", JSON.stringify(finalPayload, null, 2));

    return await makeAuthenticatedRequest(`${API_URL}/api/v1/customer-requests/submit`, {
      method: "POST",
      body: JSON.stringify(finalPayload),
    });
  } catch (error) {
    console.error("Error submitting custom request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Save a custom request as draft
 * POST /api/v1/customer-requests/drafts
 */
export async function saveAsDraft(
  payload: CustomRequestPayload
): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data) {
      return { success: false, error: "Failed to fetch user profile for customer ID" };
    }

    const finalPayload = {
      ...payload,
      customerId: profileResult.data._id,
    };

    console.log("[saveAsDraft] Payload:", JSON.stringify(finalPayload, null, 2));

    return await makeAuthenticatedRequest(`${API_URL}/api/v1/customer-requests/drafts`, {
      method: "POST",
      body: JSON.stringify(finalPayload),
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Submit an existing draft request
 * POST /api/v1/customer-requests/submit/{id}
 */
export async function submitDraft(id: string): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`[submitDraft] Submitting draft: ${id}`);

    return await makeAuthenticatedRequest(`${API_URL}/api/v1/customer-requests/submit/${id}`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error submitting draft:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing draft request (partial patch)
 * PATCH /api/v1/customer-requests/drafts/{id}
 */
export async function updateDraft(
  id: string,
  payload: DraftUpdatePayload
): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`[updateDraft] Updating draft: ${id}`);

    return await makeAuthenticatedRequest(`${API_URL}/api/v1/customer-requests/drafts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch a single customer request by ID
 * GET /api/v1/customer-requests/{id}
 */
export async function fetchCustomerRequestById(
  id: string
): Promise<ActionResponse<CustomerRequest>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`[fetchCustomerRequestById] Fetching request: ${id}`);

    return await makeAuthenticatedRequest<CustomerRequest>(
      `${API_URL}/api/v1/customer-requests/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  } catch (error) {
    console.error("Error fetching customer request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch authenticated user's customer requests with filtering and pagination
 * GET /api/v1/customer-requests/me
 */
export async function fetchCustomerRequests(
  page = 1,
  limit = 10,
  filters?: CustomerRequestFilters
): Promise<ActionResponse<CustomerRequestListResponse>> {
  console.log(`[fetchCustomerRequests] CALLED page=${page} limit=${limit} filters=${JSON.stringify(filters)}`);

  if (!API_URL) {
    console.error("[fetchCustomerRequests] BACKEND_URL not configured!");
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.serviceCategoryId) {
      queryParams.set("serviceCategoryId", filters.serviceCategoryId);
    }
    if (filters?.status) {
      queryParams.set("status", filters.status);
    }
    if (filters?.dateFrom) {
      queryParams.set("dateFrom", filters.dateFrom);
    }
    if (filters?.dateTo) {
      queryParams.set("dateTo", filters.dateTo);
    }
    if (filters?.search) {
      queryParams.set("search", filters.search);
    }

    const url = `${API_URL}/api/v1/customer-requests/me?${queryParams}`;
    console.log("[fetchCustomerRequests] URL:", url);

    const result = await makeAuthenticatedRequest<CustomerRequestListResponse>(url, {
      method: "GET",
      cache: "no-store",
    });

    console.log(`[fetchCustomerRequests] Result: success=${result.success}, hasData=${!!result.data}, error=${result.error || 'none'}`);
    return result;
  } catch (error) {
    console.error("[fetchCustomerRequests] UNCAUGHT ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a customer request
 * DELETE /api/v1/customer-requests/{id}
 */
export async function deleteCustomerRequest(
  id: string
): Promise<ActionResponse<void>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`[deleteCustomerRequest] Deleting request: ${id}`);

    const result = await makeAuthenticatedRequest<void>(
      `${API_URL}/api/v1/customer-requests/${id}`,
      { method: "DELETE" }
    );

    if (result.success) {
      await import("next/cache").then((mod) => mod.revalidatePath("/client/requests"));
    }

    return result;
  } catch (error) {
    console.error("Error deleting customer request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Cancel a customer request
 * PATCH /api/v1/customer-requests/{id}/cancel
 */
export async function cancelCustomerRequest(
  id: string
): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`[cancelCustomerRequest] Cancelling request: ${id}`);

    const result = await makeAuthenticatedRequest(
      `${API_URL}/api/v1/customer-requests/${id}/cancel`,
      { method: "PATCH" }
    );

    if (result.success) {
      await import("next/cache").then((mod) => mod.revalidatePath("/client/requests"));
    }

    return result;
  } catch (error) {
    console.error("Error cancelling customer request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Legacy export for backward compatibility during migration
export const createCustomRequest = submitCustomRequest;
