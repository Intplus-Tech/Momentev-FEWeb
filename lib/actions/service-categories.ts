"use server";

import { getAccessToken } from "@/lib/session";
import type {
  ServiceCategory,
  ServiceSpecialty,
  PaginatedResponse,
  DirectArrayResponse,
  SuggestedTagsResponse,
} from "@/types/service";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch all service categories with pagination
 */
export async function fetchServiceCategories(
  page = 1,
  limit = 50,
): Promise<ActionResponse<PaginatedResponse<ServiceCategory>>> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/service-categories?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // Let TanStack Query handle caching
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      return {
        success: false,
        error: `Failed to fetch categories: ${response.statusText}`,
      };
    }

    const data: PaginatedResponse<ServiceCategory> = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch specialties for a specific service category
 */
export async function fetchServiceSpecialtiesByCategory(
  categoryId: string,
): Promise<ActionResponse<DirectArrayResponse<ServiceSpecialty>>> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/service-specialties/by-category/${categoryId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // Let TanStack Query handle caching
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 404) {
        return { success: false, error: "Category not found" };
      }
      return {
        success: false,
        error: `Failed to fetch specialties: ${response.statusText}`,
      };
    }

    const data: DirectArrayResponse<ServiceSpecialty> = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching service specialties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch suggested tags for a specific service category
 */
export async function fetchSuggestedTags(
  categoryId: string,
): Promise<ActionResponse<SuggestedTagsResponse>> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/service-categories/${categoryId}/suggested-tags`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // Let TanStack Query handle caching
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 404) {
        return { success: false, error: "Category not found" };
      }
      return {
        success: false,
        error: `Failed to fetch suggested tags: ${response.statusText}`,
      };
    }

    const data: SuggestedTagsResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching suggested tags:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
