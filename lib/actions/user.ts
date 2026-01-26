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

    /**
     * Optimize user profile data to remove redundancy
     */
    function optimizeProfileData(data: any): any {
      if (!data) return data;
      const optimized = { ...data };

      // 1. Simplify vendor.userId -> just the ID string if it's an object
      if (optimized.vendor && optimized.vendor.userId && typeof optimized.vendor.userId === 'object') {
        optimized.vendor.userId = optimized.vendor.userId._id || optimized.vendor.userId.id;
      }

      // 2. We keep the businessProfile complete as requested, even if vendorId is redundant.

      return optimized;
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
            const optimizedRetry = optimizeProfileData(retryData.data);
            console.log('✅ [GetUserProfile] Optimized Data:', JSON.stringify(optimizedRetry, null, 2));
            return { success: true, data: optimizedRetry };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = (data as any)?.message;
      return { success: false, error: message || `Failed to fetch profile (${response.status})` };
    }

    const optimizedData = optimizeProfileData(data?.data);
    console.log('✅ [GetUserProfile] Optimized Data:', JSON.stringify(optimizedData, null, 2));

    return { success: true, data: optimizedData };
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
  addressId?: string;
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

/**
 * Delete the currently logged-in user's account
 */
export async function deleteAccount() {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          // Retry with new token
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });

          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true };
          }

          const retryMessage = (retryData as any)?.message;
          return { success: false, error: retryMessage || `Failed to delete account (${retryResponse.status})` };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = (data as any)?.message;
      return { success: false, error: message || `Failed to delete account (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Set password for Google OAuth users
 * Allows users who signed up via Google to set a password and enable dual authentication
 */
export async function setPassword(password: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/set-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          // Retry with new token
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/set-password`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
            cache: 'no-store',
          });

          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true };
          }

          const retryMessage = (retryData as any)?.message;
          return { success: false, error: retryMessage || `Failed to set password (${retryResponse.status})` };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      // Handle 409 - Password already set or user is not a Google OAuth user
      if (response.status === 409) {
        const message = (data as any)?.message || 'Password already set or user is not a Google OAuth user';
        return { success: false, error: message };
      }

      const message = (data as any)?.message;
      return { success: false, error: message || `Failed to set password (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Get supported vendor permissions
 * GET /api/v1/vendors/permissions
 */
export async function getVendorPermissions() {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/permissions`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok && retryData) {
            return { success: true, data: retryData.data };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      return { success: false, error: data?.message || 'Failed to fetch permissions' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export type VendorPermissionInput = {
  name: string;
  read: boolean;
  write: boolean;
};

export type AddVendorStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  permissions: VendorPermissionInput[];
  isActive: boolean;
};

/**
 * Add a new vendor staff member
 * POST /api/v1/vendors/{vendorId}/staff
 */
export async function addVendorStaff(input: AddVendorStaffInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get vendorId from profile
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data?.vendor?._id) {
      return { success: false, error: 'Vendor profile not found' };
    }
    const vendorId = profileResult.data.vendor._id;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          const retryMessage = (retryData as any)?.message;
          return { success: false, error: retryMessage || `Failed to add staff (${retryResponse.status})` };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = data?.message;
      return { success: false, error: message || `Failed to add staff (${response.status})` };
    }

    return { success: true, data: data?.data };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Get vendor staff list
 * GET /api/v1/vendors/{vendorId}/staff
 */
export async function getVendorStaff() {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get vendorId from profile
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data?.vendor?._id) {
      return { success: false, error: 'Vendor profile not found' };
    }
    const vendorId = profileResult.data.vendor._id;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = data?.message;
      return { success: false, error: message || `Failed to fetch staff (${response.status})` };
    }

    return { success: true, data: data?.data };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export type UpdateVendorStaffInput = {
  permissions?: VendorPermissionInput[];
  isActive?: boolean;
};

/**
 * Update a vendor staff member
 * PATCH /api/v1/vendors/{vendorId}/staff/{staffId}
 */
export async function updateVendorStaff(staffId: string, input: UpdateVendorStaffInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get vendorId from profile
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data?.vendor?._id) {
      return { success: false, error: 'Vendor profile not found' };
    }
    const vendorId = profileResult.data.vendor._id;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff/${staffId}`, {
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
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff/${staffId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = data?.message;
      return { success: false, error: message || `Failed to update staff (${response.status})` };
    }

    return { success: true, data: data?.data };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Delete a vendor staff member
 * DELETE /api/v1/vendors/{vendorId}/staff/{staffId}
 */
export async function deleteVendorStaff(staffId: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get vendorId from profile
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data?.vendor?._id) {
      return { success: false, error: 'Vendor profile not found' };
    }
    const vendorId = profileResult.data.vendor._id;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/staff/${staffId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true };
          }
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const message = data?.message;
      return { success: false, error: message || `Failed to delete staff (${response.status})` };
    }

    return { success: true };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

