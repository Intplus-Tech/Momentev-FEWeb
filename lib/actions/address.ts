'use server';

import { getAccessToken, tryRefreshToken } from '@/lib/session';
import type { Address, CreateAddressInput, UpdateAddressInput } from '@/types/address';

/**
 * Get an address by ID
 */
export async function getAddress(id: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/addresses/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null) as { data: Address, message: string } | null;

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          // Retry with new token
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/addresses/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null) as { data: Address, message: string } | null;

          if (retryResponse.ok && retryData) {
            return { success: true, data: retryData.data };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = (data as any)?.message;
      return { success: false, error: message || `Failed to fetch address (${response.status})` };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function createAddress(input: CreateAddressInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    console.log('Creating address with payload:', input);

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    console.log('Backend response:', { status: response.status, data });

    if (!response.ok) {
      const errorData = data as any;
      let errorMessage = errorData?.message || `Failed to create address (${response.status})`;

      // If there are specific validation errors, append them
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationMessages = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
        if (validationMessages) {
          errorMessage += `: ${validationMessages}`;
        }
      }

      console.error('Address creation failed:', errorMessage);
      return { success: false, error: errorMessage };
    }

    return { success: true, data: data?.data as Address };
  } catch (error) {
    console.error('Address creation exception:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(id: string, input: UpdateAddressInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorData = data as any;
      let errorMessage = errorData?.message || `Failed to update address (${response.status})`;

      // If there are specific validation errors, append them
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationMessages = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
        if (validationMessages) {
          errorMessage += `: ${validationMessages}`;
        }
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, data: data?.data as Address };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
