"use server";

import { getAccessToken, tryRefreshToken } from '@/lib/session';
import type { Review as ApiReview } from '@/types/review';

export type Review = ApiReview;

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

/**
 * Get reviews for a vendor
 * GET /api/v1/vendors/{vendorId}/reviews
 */
export type VendorReview = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export type GetVendorReviewsResponse = {
  data: VendorReview[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchVendorReviews(vendorId: string, page = 1, limit = 10) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/vendors/${vendorId}/reviews?page=${page}&limit=${limit}`,
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
      return { success: false, error: data?.message || `Failed to fetch vendor reviews (${response.status})` };
    }

    return { success: true, data: data?.data as GetVendorReviewsResponse };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function createReview(data: { vendorId: string; bookingId?: string; rating: number; comment: string }) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          return { success: false, error: retryData?.message || 'Failed to submit review' };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      // Explicit handling for known review errors
      if (response.status === 403) {
        return { success: false, error: 'Booking is not completed. Reviews can only be created for completed bookings.' };
      }
      if (response.status === 409) {
        return { success: false, error: 'A review for this booking already exists.' };
      }
      return { success: false, error: result?.message || `Failed to submit review (${response.status})` };
    }

    // Normalize API response to expected shape when possible
    const apiData = result?.data;
    // If backend already returns the canonical review object, pass through
    if (apiData && typeof apiData === 'object') {
      return { success: true, data: apiData };
    }

    return { success: true, data: apiData };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData.data };
          }
          return { success: false, error: retryData?.message || 'Failed to update review' };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      if (response.status === 403) {
        return { success: false, error: 'You can only edit your own reviews.' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Review not found.' };
      }
      return { success: false, error: result?.message || 'Failed to update review' };
    }

    return { success: true, data: result?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          const retryData = await retryResponse.json().catch(() => null);

          if (retryResponse.ok) {
            return { success: true, data: retryData?.data ?? retryData };
          }
          return { success: false, error: retryData?.message || 'Failed to delete review' };
        }
        return { success: false, error: 'Session expired. Please login again.' };
      }
      if (response.status === 403) {
        return { success: false, error: 'You can only delete your own reviews.' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Review not found.' };
      }
      return { success: false, error: result?.message || 'Failed to delete review' };
    }

    return { success: true, data: result?.data ?? result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
