'use server';

import { getAccessToken, tryRefreshToken } from "@/lib/session";

type CreateSupportRequestInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export async function createSupportRequest(input: CreateSupportRequestInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    // Try to get token, but authentication is optional for this endpoint generally
    // However, for vendor settings context, we likely want to send it if available so backend can infer vendorId
    const token = await getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/support-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // If unauthorized and we had a token, try refresh
      if (response.status === 401 && token) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/support-requests`, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${refreshResult.token}`,
            },
            body: JSON.stringify(input),
            cache: 'no-store',
          });

          const retryData = await retryResponse.json().catch(() => null);
          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          const retryMessage = retryData?.message;
          return { success: false, error: retryMessage || `Failed to create support request (${retryResponse.status})` };
        }
      }

      const message = data?.message;
      // If validation error, might have detailed errors
      if (data?.errors) {
        // Could format this better, but simplest is to join them or just return generic message + details
        return { success: false, error: message || 'Validation failed' };
      }
      return { success: false, error: message || `Failed to create support request (${response.status})` };
    }

    return { success: true, data: data?.data };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
