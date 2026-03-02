'use server';

import { getAccessToken, tryRefreshToken } from '@/lib/session';

export async function getMyFavorites(page = 1, limit = 10) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites?page=${page}&limit=${limit}`, {
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
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites?page=${page}&limit=${limit}`, {
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
      return { success: false, error: data?.message || 'Failed to fetch favorites' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function checkFavoriteStatus(vendorId: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
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
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
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
      return { success: false, error: data?.message || 'Failed to check favorite status' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function addFavorite(vendorId: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
      method: 'POST',
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
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
            method: 'POST',
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
      return { success: false, error: data?.message || 'Failed to add favorite' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function removeFavorite(vendorId: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
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
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/customers/me/favorites/${vendorId}`, {
            method: 'DELETE',
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
      return { success: false, error: data?.message || 'Failed to remove favorite' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
