"use server";

import { getAccessToken } from "@/lib/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -- Types --

export type UpdateVendorServiceInput = {
  tags?: string[];
  minimumBookingDuration?: string;
  leadTimeRequired?: string;
  maximumEventSize?: string;
  additionalFees?: {
    name: string;
    price: string;
    feeCategory?: string;
  }[];
};

// -- Actions --

/**
 * Update an existing vendor service
 * PUT /api/v1/vendor-services/{id}
 */
export async function updateVendorService(
  id: string,
  input: UpdateVendorServiceInput,
): Promise<ActionResponse> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/v1/vendor-services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    console.info("[updateVendorService] request/response", {
      id,
      tags: input.tags,
      minimumBookingDuration: input.minimumBookingDuration,
      leadTimeRequired: input.leadTimeRequired,
      maximumEventSize: input.maximumEventSize,
      additionalFees: input.additionalFees,
      status: response.status,
      ok: response.ok,
      body: data,
      bodyString: JSON.stringify(data, null, 2),
    });

    if (!response.ok) {
      let errorMessage = data.message || "Failed to update vendor service";

      if (data.errors?.body?.fieldErrors) {
        const fieldErrors = data.errors.body.fieldErrors;
        const detailed = Object.entries(fieldErrors)
          .map(
            ([field, msgs]) =>
              `${field}: ${(msgs as string[]).join(", ")}`,
          )
          .join("; ");
        if (detailed) {
          errorMessage = `Validation failed: ${detailed}`;
        }
      }

      console.error("[updateVendorService] failed", {
        id,
        status: response.status,
        body: data,
        errorMessage,
      });
      return { success: false, error: errorMessage };
    }

    revalidatePath("/vendor/services", "page");

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error updating vendor service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a vendor service
 * DELETE /api/v1/vendor-services/{id}
 */
export async function deleteVendorService(
  id: string,
): Promise<ActionResponse> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/v1/vendor-services/${id}`, {
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
        error:
          data?.message ||
          `Failed to delete vendor service: ${response.statusText}`,
      };
    }

    revalidatePath("/vendor/services", "page");

    return { success: true };
  } catch (error) {
    console.error("Error deleting vendor service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
