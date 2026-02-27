"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";
import {
  VendorQuoteRequest,
  VendorQuoteRequestFilters,
  VendorQuoteRequestListResponse,
} from "@/types/quote-request";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function makeAuthenticatedRequest<T>(
  url: string,
  options: RequestInit
): Promise<ActionResponse<T>> {
  const token = await getAccessToken();

  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[quote-requests] Failed to parse JSON:", text.substring(0, 200));
      return { success: false, error: "Invalid JSON response from server" };
    }

    if (!response.ok) {
      console.error("[quote-requests] Error:", response.status, data?.message || "Unknown error");

      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(url, {
            ...options,
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.token}`,
              ...options.headers,
            },
          });

          const retryText = await retryResponse.text();
          let retryData;
          try {
            retryData = JSON.parse(retryText);
          } catch {
            return { success: false, error: "Invalid JSON response on retry" };
          }

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          return {
            success: false,
            error: retryData.message || "Request failed after token refresh",
          };
        }
      }
      return { success: false, error: data.message || "Request failed" };
    }

    return { success: true, data: data.data };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`[quote-requests] TIMEOUT after 15s for ${url}`);
      return { success: false, error: "Request timed out" };
    }
    console.error("[quote-requests] FETCH ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Fetch vendor quote requests with filtering and pagination
 * GET /api/v1/quote-requests/vendor/me
 */
export async function fetchVendorQuoteRequests(
  page = 1,
  limit = 10,
  filters?: VendorQuoteRequestFilters
): Promise<ActionResponse<VendorQuoteRequestListResponse>> {
  if (!API_URL) {
    console.error("[fetchVendorQuoteRequests] BACKEND_URL not configured!");
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

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

    const url = `${API_URL}/api/v1/quote-requests/vendor/me?${queryParams}`;

    return await makeAuthenticatedRequest<VendorQuoteRequestListResponse>(url, {
      method: "GET",
    });
  } catch (error) {
    console.error("[fetchVendorQuoteRequests] UNCAUGHT ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
