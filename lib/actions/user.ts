'use server';

import { getAccessToken, tryRefreshToken } from '@/lib/session';
import type { UserProfile } from '@/types/auth';

/**
 * Get the currently logged-in user's profile
 */
export async function getUserProfile() {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null) as { data: UserProfile, message: string } | null;

    console.log(" getUserProfile", data);

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          // Retry with new token
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null) as { data: UserProfile, message: string } | null;

          if (retryResponse.ok && retryData) {
            return { success: true, data: retryData.data };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = (data as any)?.message;
      return { success: false, error: message || `Failed to fetch profile (${response.status})` };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
};

export async function updateUserProfile(input: UpdateProfileInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    console.log(data);

    if (!response.ok) {
      const errorData = data as any;
      let errorMessage = errorData?.message || `Failed to update profile (${response.status})`;

      // If there are specific validation errors, append them
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationMessages = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
        if (validationMessages) {
          errorMessage += `: ${validationMessages}`;
        }
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
