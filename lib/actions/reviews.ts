'use server';

import { getAccessToken, tryRefreshToken } from '@/lib/session';

export type Review = {
  _id: string;
  vendorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: {
      url: string;
    };
    category?: string; // Assuming category might come from vendor profile populate
  };
  customerId: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

export type GetReviewsResponse = {
  data: Review[];
  total: number;
  page: number;
  limit: number;
};

export async function getClientReviews(customerId: string, page = 1, limit = 20) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/customer-profile-management/${customerId}/reviews?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(
            `${process.env.BACKEND_URL}/api/v1/customer-profile-management/${customerId}/reviews?page=${page}&limit=${limit}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshResult.token}`,
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            }
          );
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            // API response structure seems to be { message: string, data: { data: [], total: ... } }
            return { success: true, data: retryData.data as GetReviewsResponse };
          }
          return { success: false, error: retryData?.message || 'Failed to fetch reviews' };
        }
        return { success: false, error: 'Session expired' };
      }
      return { success: false, error: data?.message || 'Failed to fetch reviews' };
    }

    return { success: true, data: data?.data as GetReviewsResponse };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
