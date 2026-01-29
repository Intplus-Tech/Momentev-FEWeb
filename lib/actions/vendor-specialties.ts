"use server";

import { getAccessToken } from "@/lib/session";
import type {
  PaginatedResponse,
  VendorSpecialty,
} from "@/types/service";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch vendor specialties with pagination
 */
export async function fetchVendorSpecialties(
  page = 1,
  limit = 10,
  vendorId?: string,
): Promise<ActionResponse<PaginatedResponse<VendorSpecialty>>> {
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

    let url = `${API_URL}/api/v1/vendor-specialties?page=${page}&limit=${limit}`;
    if (vendorId) {
      url += `&vendorId=${vendorId}`;
    }

    const response = await fetch(url, {
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
      return {
        success: false,
        error: `Failed to fetch vendor specialties: ${response.statusText}`,
      };
    }

    const data: PaginatedResponse<VendorSpecialty> = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching vendor specialties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
