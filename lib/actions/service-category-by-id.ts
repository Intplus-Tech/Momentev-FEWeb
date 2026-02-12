"use server";

import { getAccessToken } from "@/lib/session";
import type { ServiceCategory, SingleResponse } from "@/types/service";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch a single service category by ID
 */
export async function fetchServiceCategoryById(
  id: string,
): Promise<ActionResponse<SingleResponse<ServiceCategory>>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(`${API_URL}/api/v1/service-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 404) {
        return { success: false, error: "Service category not found" };
      }
      return {
        success: false,
        error: `Failed to fetch service category: ${response.statusText}`,
      };
    }

    const data: SingleResponse<ServiceCategory> = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching service category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
