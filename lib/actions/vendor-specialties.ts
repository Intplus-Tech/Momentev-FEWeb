"use server";

import { getAccessToken } from "@/lib/session";
import { majorToMinor } from "@/lib/currency";
import type {
  PaginatedResponse,
  VendorSpecialty,
} from "@/types/service";
import { revalidatePath } from "next/cache";

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

export type CreateVendorSpecialtyInput = {
  vendorId: string;
  serviceSpecialty: string;
  priceCharge: string;
  price: string;
};

export type UpdateVendorSpecialtyInput = {
  price?: string | number;
  priceCharge?: string;
};

type VendorSpecialtyMutationInput = {
  price?: string | number;
  priceCharge?: string;
  serviceSpecialty?: string;
  vendorId?: string;
};

async function sendVendorSpecialtyMutation(
  url: string,
  method: "POST" | "PUT",
  accessToken: string,
  input: VendorSpecialtyMutationInput,
) {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...input,
      price:
        input.price === undefined || input.price === null || input.price === ""
          ? undefined
          : String(majorToMinor(input.price)),
    }),
    cache: "no-store",
  });
}

/**
 * Create a new vendor specialty
 * POST /api/v1/vendor-specialties
 */
export async function createVendorSpecialty(
  input: CreateVendorSpecialtyInput,
): Promise<ActionResponse<VendorSpecialty>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await sendVendorSpecialtyMutation(
      `${API_URL}/api/v1/vendor-specialties`,
      "POST",
      accessToken,
      input,
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to create vendor specialty: ${response.statusText}`,
      };
    }

    revalidatePath("/vendor/services", "page");

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating vendor specialty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateVendorSpecialty(
  id: string,
  input: UpdateVendorSpecialtyInput
): Promise<ActionResponse<VendorSpecialty>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await sendVendorSpecialtyMutation(
      `${API_URL}/api/v1/vendor-specialties/${id}`,
      "PUT",
      accessToken,
      input,
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to update vendor specialty: ${response.statusText}`,
      };
    }

    revalidatePath("/vendor/services", "page");

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error updating vendor specialty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function bulkUpdateVendorSpecialtiesPricing(
  ids: string[],
  input: UpdateVendorSpecialtyInput,
): Promise<ActionResponse<null>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  if (ids.length === 0) {
    return { success: true };
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const results = await Promise.all(
      ids.map((id) =>
        sendVendorSpecialtyMutation(
          `${API_URL}/api/v1/vendor-specialties/${id}`,
          "PUT",
          accessToken,
          input,
        ),
      ),
    );

    const failed = results.find((response) => !response.ok);
    if (failed) {
      const data = await failed.json().catch(() => ({}));
      return {
        success: false,
        error:
          data.message || `Failed to update vendor specialty: ${failed.statusText}`,
      };
    }

    revalidatePath("/vendor/services", "page");

    return { success: true };
  } catch (error) {
    console.error("Error bulk updating vendor specialties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteVendorSpecialty(
  id: string
): Promise<ActionResponse<null>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/v1/vendor-specialties/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || `Failed to delete vendor specialty: ${response.statusText}`,
      };
    }

    revalidatePath("/vendor/services", "page");

    return { success: true };
  } catch (error) {
    console.error("Error deleting vendor specialty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

