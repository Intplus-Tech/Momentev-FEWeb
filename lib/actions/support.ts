'use server';

import { getAccessToken, tryRefreshToken } from "@/lib/session";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupportRequest = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  vendorId: { _id: string } | null;
  clientId: { _id: string } | null;
  archivedAt: string | null;
  archivedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportRequestsPage = {
  data: SupportRequest[];
  total: number;
  page: number;
  limit: number;
};

type CreateSupportRequestInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function authedFetch(
  url: string,
  options: RequestInit,
  token: string,
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/support-requests
 * Authentication is optional — if authenticated the backend auto-infers vendorId / clientId.
 */
export async function createSupportRequest(input: CreateSupportRequestInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/support-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && token) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await authedFetch(
            `${process.env.BACKEND_URL}/api/v1/support-requests`,
            { method: 'POST', body: JSON.stringify(input) },
            refreshResult.token,
          );
          const retryData = await retryResponse.json().catch(() => null);
          if (retryResponse.ok) return { success: true, data: retryData.data as SupportRequest };
          return { success: false, error: retryData?.message || `Failed to create support request (${retryResponse.status})` };
        }
      }
      return { success: false, error: data?.message || `Failed to create support request (${response.status})` };
    }

    return { success: true, data: data?.data as SupportRequest };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

/**
 * GET /api/v1/support-requests/me
 * Returns a paginated list of the authenticated user's own support requests.
 */
export async function getMySupportRequests(page = 1, limit = 10) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const url = `${process.env.BACKEND_URL}/api/v1/support-requests/me?page=${page}&limit=${limit}`;

    const response = await authedFetch(url, { method: 'GET' }, token);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await authedFetch(url, { method: 'GET' }, refreshResult.token);
          const retryData = await retryResponse.json().catch(() => null);
          if (retryResponse.ok) return { success: true, data: retryData.data as SupportRequestsPage };
          return { success: false, error: retryData?.message || 'Failed to fetch support requests' };
        }
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      return { success: false, error: data?.message || `Failed to fetch support requests (${response.status})` };
    }

    return { success: true, data: data?.data as SupportRequestsPage };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

/**
 * GET /api/v1/support-requests/{id}
 * Admins can view any request; others can only view their own or vendor-linked ones.
 */
export async function getSupportRequestById(id: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const url = `${process.env.BACKEND_URL}/api/v1/support-requests/${id}`;

    const response = await authedFetch(url, { method: 'GET' }, token);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await authedFetch(url, { method: 'GET' }, refreshResult.token);
          const retryData = await retryResponse.json().catch(() => null);
          if (retryResponse.ok) return { success: true, data: retryData.data as SupportRequest };
          return { success: false, error: retryData?.message || 'Failed to fetch support request' };
        }
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      return { success: false, error: data?.message || `Failed to fetch support request (${response.status})` };
    }

    return { success: true, data: data?.data as SupportRequest };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

