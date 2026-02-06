"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";
import {
  CustomRequestPayload,
  CustomerRequestListResponse,
} from "@/types/custom-request";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new custom request
 * POST /api/v1/custom-requests
 */
export async function createCustomRequest(
  payload: CustomRequestPayload
): Promise<ActionResponse<any>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/v1/custom-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration retry logic if needed, similar to other actions
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${API_URL}/api/v1/custom-requests`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.token}`,
            },
            body: JSON.stringify(payload),
          });
          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          return { success: false, error: retryData.message || "Failed to create request after refresh" };
        }
      }
      return {
        success: false,
        error: data.message || "Failed to create custom request",
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating custom request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch customer requests
 * GET /api/v1/customer-requests
 */
export async function fetchCustomerRequests(
  page = 1,
  limit = 10
): Promise<ActionResponse<CustomerRequestListResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_URL}/api/v1/customer-requests?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${API_URL}/api/v1/customer-requests?${queryParams}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.token}`,
            },
            cache: "no-store",
          });
          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
        }
      }
      return {
        success: false,
        error: data.message || "Failed to fetch customer requests",
      };
    }

    // The sample response has a nested "data" field: { message, data: { data: [], total, page... } }
    // We expect `data.data` to be the CustomerRequestListResponse
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error fetching customer requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a customer request
 * DELETE /api/v1/customer-requests/:id
 */
export async function deleteCustomerRequest(
  id: string,
): Promise<ActionResponse<void>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const url = `${API_URL}/api/v1/customer-requests/${id}`;
    console.log(`[deleteCustomerRequest] Deleting request: ${id}`);
    console.log(`[deleteCustomerRequest] Endpoint: ${url}`);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[deleteCustomerRequest] Response Status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.log(`[deleteCustomerRequest] 401 Unauthorized, attempting refresh`);
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          console.log(`[deleteCustomerRequest] Refresh successful, retrying delete`);
          const retryResponse = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${refreshResult.token}`,
            },
          });
          console.log(`[deleteCustomerRequest] Retry Response Status: ${retryResponse.status}`);
          if (retryResponse.ok) {
            await import("next/cache").then((mod) => mod.revalidatePath("/client/requests"));
            console.log(`[deleteCustomerRequest] Retry delete successful`);
            return { success: true };
          }
        } else {
          console.log(`[deleteCustomerRequest] Refresh failed`);
        }
      }
      const data = await response.json();
      console.error(`[deleteCustomerRequest] Error response:`, data);
      return {
        success: false,
        error: data.message || "Failed to delete customer request",
      };
    }

    console.log(`[deleteCustomerRequest] Successfully deleted`);
    await import("next/cache").then((mod) => mod.revalidatePath("/client/requests"));
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
