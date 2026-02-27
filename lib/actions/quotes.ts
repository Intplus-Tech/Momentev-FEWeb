"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";
import { 
  QuotePayload, 
  QuotePatchPayload, 
  QuoteDraft,
  VendorQuoteFilters,
  VendorQuoteListResponse,
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await doFetch(token);
    clearTimeout(timeoutId);

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
 * Create a new draft quote
 * POST /api/v1/quotes/drafts
 */
export async function createQuoteDraft(
  payload: QuotePayload
): Promise<ActionResponse<QuoteDraft>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };
  return makeAuthenticatedRequest<QuoteDraft>(
    `${API_URL}/api/v1/quotes/drafts`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

/**
 * Update an existing draft quote (all fields optional)
 * PATCH /api/v1/quotes/drafts/{quoteId}
 */
export async function updateQuoteDraft(
  quoteId: string,
  patch: QuotePatchPayload
): Promise<ActionResponse<QuoteDraft>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };
  return makeAuthenticatedRequest<QuoteDraft>(
    `${API_URL}/api/v1/quotes/drafts/${quoteId}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
}

/**
 * Send a draft quote to the customer (transitions status to "sent")
 * POST /api/v1/quotes/{quoteId}/send
 */
export async function sendQuote(
  quoteId: string
): Promise<ActionResponse<QuoteDraft>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };
  return makeAuthenticatedRequest<QuoteDraft>(
    `${API_URL}/api/v1/quotes/${quoteId}/send`,
    { method: "POST" }
  );
}
/**
 * Fetch paginated quotes for the current vendor
 * GET /api/v1/quotes/vendor/me
 */
export async function fetchVendorQuotes(
  page = 1,
  limit = 10,
  filters?: VendorQuoteFilters
): Promise<ActionResponse<VendorQuoteListResponse>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status && (filters.status as string) !== "all") {
    queryParams.append("status", filters.status);
  }
  if (filters?.quoteRequestId) {
    queryParams.append("quoteRequestId", filters.quoteRequestId);
  }

  return makeAuthenticatedRequest<VendorQuoteListResponse>(
    `${API_URL}/api/v1/quotes/vendor/me?${queryParams.toString()}`,
    { method: "GET" }
  );
}

/**
 * Withdraw a sent quote. The quote is no longer available to the customer.
 * POST /api/v1/quotes/{quoteId}/withdraw
 */
export async function withdrawQuote(
  quoteId: string
): Promise<ActionResponse<void>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };
  return makeAuthenticatedRequest<void>(
    `${API_URL}/api/v1/quotes/${quoteId}/withdraw`,
    { method: "POST" }
  );
}

/**
 * Creates a new revision of the quote. The old quote is marked as revised.
 * POST /api/v1/quotes/{quoteId}/revise
 */
export async function reviseQuote(
  quoteId: string,
  payload: QuotePatchPayload
): Promise<ActionResponse<QuoteDraft>> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };
  return makeAuthenticatedRequest<QuoteDraft>(
    `${API_URL}/api/v1/quotes/${quoteId}/revise`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}
