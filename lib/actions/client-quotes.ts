"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";
import type {
  CustomerQuoteListResponse,
  CustomerQuoteFilters,
} from "@/types/quote";

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
  if (!token) return { success: false, error: "Not authenticated" };

  const doFetch = async (authToken: string) =>
    fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...options.headers,
      },
    });

  try {
    const response = await doFetch(token);
    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: "Invalid JSON response from server" };
    }

    if (!response.ok) {
      if (response.status === 401) {
        const refresh = await tryRefreshToken();
        if (refresh.success && refresh.token) {
          const retry = await doFetch(refresh.token);
          const retryText = await retry.text();
          let retryData: Record<string, unknown>;
          try {
            retryData = JSON.parse(retryText);
          } catch {
            return { success: false, error: "Invalid JSON on retry" };
          }
          if (retry.ok) return { success: true, data: retryData.data as T };
          return { success: false, error: (retryData.message as string) || "Request failed after token refresh" };
        }
      }
      return { success: false, error: (data.message as string) || "Request failed" };
    }

    return { success: true, data: data.data as T };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError")
      return { success: false, error: "Request timed out" };
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Fetch paginated quotes for the authenticated customer
 * GET /api/v1/quotes/me
 */
export async function fetchCustomerQuotes(
  page = 1,
  limit = 10,
  filters?: CustomerQuoteFilters
): Promise<ActionResponse<CustomerQuoteListResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status && (filters.status as string) !== "") {
    params.append("status", filters.status);
  }
  if (filters?.quoteRequestId) {
    params.append("quoteRequestId", filters.quoteRequestId);
  }

  return makeAuthenticatedRequest<CustomerQuoteListResponse>(
    `${API_URL}/api/v1/quotes/me?${params.toString()}`,
    { method: "GET" }
  );
}
