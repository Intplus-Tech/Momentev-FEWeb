"use server";

import { fetchWithAuthRetry } from "@/lib/actions/auth-retry";
import { getUserProfile } from "./user";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface VendorProfilePayload {
  profilePhoto: string;
  coverPhoto?: string;
  portfolioGallery?: string[];
  socialMediaLinks?: { name: string; link: string }[];
}

interface VendorProfileResponse {
  message: string;
  data: {
    _id: string;
    profilePhoto?: { url: string };
    coverPhoto?: { url: string };
    portfolioGallery?: { url: string }[];
    isActive: boolean;
    onBoardingStage: number;
    updatedAt: string;
  };
}

async function vendorAuthFetch(
  path: string,
  init: { method: string; body?: string },
  options?: { accessToken?: string },
) {
  return fetchWithAuthRetry(
    (authToken) =>
      fetch(`${API_URL}${path}`, {
        method: init.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        ...(init.body ? { body: init.body } : {}),
        cache: "no-store",
      }),
    { token: options?.accessToken },
  );
}

function mapAuthFailure(
  error?: string,
  errorCode?: string,
): ActionResponse<VendorProfileResponse> {
  if (errorCode === "FORBIDDEN") {
    return { success: false, error: "You do not have permission to perform this action." };
  }
  return { success: false, error: error || "Authentication required" };
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) {
    return "Unauthorized";
  }
  if (response.status === 400) {
    const errorData = await response.json().catch(() => null);
    return errorData?.message || "Validation error";
  }
  return fallback;
}

/**
 * Submit vendor profile media (Step 4)
 * PATCH /api/v1/vendors/{vendorId} with allowlisted profile fields only.
 * Completes onboarding via POST /api/v1/vendors/me/onboarding/complete after a successful save.
 */
export async function submitVendorProfile(
  data: {
    profilePhoto: string;
    coverPhoto?: string;
    portfolioGallery?: string[];
    socialMediaLinks?: { name: string; link: string }[];
  }
): Promise<ActionResponse<VendorProfileResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data) {
      console.error("❌ [Step 4 Submission] Failed to get user profile:", profileResult.error);
      return {
        success: false,
        error: profileResult.error || "Failed to get user profile",
      };
    }

    const vendorId = profileResult.data.vendor?._id;
    if (!vendorId) {
      console.error("❌ [Step 4 Submission] No vendor ID found in user profile");
      return {
        success: false,
        error: "No vendor ID found. Please ensure you have a vendor account.",
      };
    }

    const payload: VendorProfilePayload = {
      profilePhoto: data.profilePhoto,
      ...(data.coverPhoto ? { coverPhoto: data.coverPhoto } : {}),
      ...(data.portfolioGallery && data.portfolioGallery.length > 0
        ? { portfolioGallery: data.portfolioGallery }
        : {}),
      ...(data.socialMediaLinks && data.socialMediaLinks.length > 0
        ? { socialMediaLinks: data.socialMediaLinks }
        : {}),
    };

    const { response, error, errorCode } = await vendorAuthFetch(
      `/api/v1/vendors/${vendorId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );

    if (!response) {
      console.error("❌ [Step 4 Submission] Authentication failed:", error);
      return mapAuthFailure(error, errorCode);
    }

    if (!response.ok) {
      console.error(`❌ [Step 4 Submission] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: await readErrorMessage(response, `Failed to submit vendor profile: ${response.statusText}`),
      };
    }

    const responseData: VendorProfileResponse = await response.json();

    const completeResult = await completeVendorOnboarding();
    if (!completeResult.success) {
      return {
        success: false,
        error: completeResult.error || "Failed to complete vendor onboarding",
      };
    }

    return {
      success: true,
      data: completeResult.data ?? responseData,
    };
  } catch (error) {
    console.error("💥 [Step 4 Submission] Exception caught:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Advance vendor onboarding by one server-derived stage.
 * POST /api/v1/vendors/me/onboarding/advance
 */
export async function advanceVendorOnboarding(
  options?: {
    vendorId?: string;
    accessToken?: string;
  },
): Promise<ActionResponse<VendorProfileResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await vendorAuthFetch(
      "/api/v1/vendors/me/onboarding/advance",
      { method: "POST" },
      { accessToken: options?.accessToken },
    );

    if (!response) {
      console.error("❌ [Onboarding] Authentication failed:", error);
      return mapAuthFailure(error, errorCode);
    }

    if (!response.ok) {
      console.error(`❌ [Onboarding] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: await readErrorMessage(response, `Failed to update onboarding stage: ${response.statusText}`),
      };
    }

    const responseData: VendorProfileResponse = await response.json();
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("💥 [Onboarding] Exception caught:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Complete vendor onboarding. Server derives onBoarded / isActive / stage.
 * POST /api/v1/vendors/me/onboarding/complete
 */
export async function completeVendorOnboarding(
  options?: { accessToken?: string },
): Promise<ActionResponse<VendorProfileResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await vendorAuthFetch(
      "/api/v1/vendors/me/onboarding/complete",
      { method: "POST" },
      { accessToken: options?.accessToken },
    );

    if (!response) {
      console.error("❌ [Onboarding] Authentication failed:", error);
      return mapAuthFailure(error, errorCode);
    }

    if (!response.ok) {
      console.error(`❌ [Onboarding] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: await readErrorMessage(response, `Failed to complete vendor onboarding: ${response.statusText}`),
      };
    }

    const responseData: VendorProfileResponse = await response.json();
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("💥 [Onboarding] Exception caught:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
