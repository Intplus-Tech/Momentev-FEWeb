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
  isActive?: boolean;
  onBoardingStage?: number;
  onBoarded?: boolean;
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

/**
 * Submit vendor profile media (Step 4)
 * PATCH /api/v1/vendors/{vendorId}
 * 
 * Uses vendorId in path - requires authentication as vendor owner or admin
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
    console.log("📤 [Step 4 Submission] Starting vendor profile submission...");
    console.log("📋 [Step 4 Submission] Payload:", {
      profilePhoto: data.profilePhoto,
      coverPhoto: data.coverPhoto || "omitted",
      portfolioGallery: data.portfolioGallery ? `[${data.portfolioGallery.length} images]` : "omitted",
      socialMediaLinks: data.socialMediaLinks ? `[${data.socialMediaLinks.length} links]` : "none",
    });

    // Get user profile to extract vendorId
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

    console.log(`🎫 [Step 4 Submission] Vendor ID: ${vendorId}`);

    const payload: VendorProfilePayload = {
      profilePhoto: data.profilePhoto,
      ...(data.coverPhoto ? { coverPhoto: data.coverPhoto } : {}),
      ...(data.portfolioGallery && data.portfolioGallery.length > 0
        ? { portfolioGallery: data.portfolioGallery }
        : {}),
      ...(data.socialMediaLinks && data.socialMediaLinks.length > 0
        ? { socialMediaLinks: data.socialMediaLinks }
        : {}),
      // Activate the vendor as part of the final onboarding submission.
      isActive: true,
      onBoardingStage: 4,
      onBoarded: true,
    };

    console.log(`🌐 [Step 4 Submission] Sending PATCH request to ${API_URL}/api/v1/vendors/${vendorId}`);
    console.log("📦 [Step 4 Submission] Full payload:", JSON.stringify(payload, null, 2));

    const { response, error } = await fetchWithAuthRetry((authToken) =>
      fetch(`${API_URL}/api/v1/vendors/${vendorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })
    );

    if (!response) {
      console.error("❌ [Step 4 Submission] Authentication failed:", error);
      return {
        success: false,
        error: error || "Authentication required",
      };
    }

    console.log(`📡 [Step 4 Submission] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ [Step 4 Submission] Unauthorized (401)");
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ [Step 4 Submission] Validation error (400):", JSON.stringify(errorData, null, 2));
        return {
          success: false,
          error: errorData?.message || "Validation error",
        };
      }
      console.error(`❌ [Step 4 Submission] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Failed to submit vendor profile: ${response.statusText}`,
      };
    }

    const responseData: VendorProfileResponse = await response.json();
    console.log("✅ [Step 4 Submission] Success! Profile updated.");


    return {
      success: true,
      data: responseData,
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
 * Update vendor onboarding stage
 * Called after each step is successfully submitted
 * Updates vendor.onBoardingStage to the next stage
 * 
 * PATCH /api/v1/vendors/{vendorId}
 */
export async function updateVendorOnboardingStage(
  newStage: number,
  options?: {
    vendorId?: string;
    accessToken?: string;
  },
): Promise<ActionResponse<VendorProfileResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    console.log(`📤 [Onboarding] Updating onboarding stage to ${newStage}...`);

    // Reuse provided IDs/tokens from the calling action when possible.
    let vendorId = options?.vendorId;

    if (!vendorId) {
      const profileResult = await getUserProfile();
      if (!profileResult.success || !profileResult.data) {
        console.error("❌ [Onboarding] Failed to get user profile:", profileResult.error);
        return {
          success: false,
          error: profileResult.error || "Failed to get user profile",
        };
      }
      vendorId = profileResult.data.vendor?._id;
    }

    if (!vendorId) {
      console.error("❌ [Onboarding] No vendor ID found in user profile");
      return {
        success: false,
        error: "No vendor ID found. Please ensure you have a vendor account.",
      };
    }

    const payload = {
      onBoardingStage: newStage,
    };

    console.log(`🌐 [Onboarding] Sending PATCH request to ${API_URL}/api/v1/vendors/${vendorId}`);

    const { response, error } = await fetchWithAuthRetry(
      (authToken) =>
        fetch(`${API_URL}/api/v1/vendors/${vendorId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        }),
      { token: options?.accessToken }
    );

    if (!response) {
      console.error("❌ [Onboarding] Authentication failed:", error);
      return {
        success: false,
        error: error || "Authentication required",
      };
    }

    console.log(`📡 [Onboarding] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ [Onboarding] Unauthorized (401)");
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ [Onboarding] Validation error (400):", JSON.stringify(errorData, null, 2));
        return {
          success: false,
          error: errorData?.message || "Validation error",
        };
      }
      console.error(`❌ [Onboarding] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Failed to update onboarding stage: ${response.statusText}`,
      };
    }

    const responseData: VendorProfileResponse = await response.json();
    console.log(`✅ [Onboarding] Successfully updated to stage ${newStage}`);

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
