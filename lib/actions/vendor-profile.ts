"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "./user";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface VendorProfilePayload {
  profilePhoto: string;
  coverPhoto: string;
  portfolioGallery: string[];
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
    coverPhoto: string;
    portfolioGallery: string[];
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
      coverPhoto: data.coverPhoto,
      portfolioGallery: `[${data.portfolioGallery.length} images]`,
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

    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error("❌ [Step 4 Submission] No access token found");
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const payload: VendorProfilePayload = {
      profilePhoto: data.profilePhoto,
      coverPhoto: data.coverPhoto,
      portfolioGallery: data.portfolioGallery,
      socialMediaLinks: data.socialMediaLinks,
      // Set vendor as pending approval and mark onboarding as complete
      isActive: false,
      onBoardingStage: 4,
      onBoarded: true,
    };

    console.log(`🌐 [Step 4 Submission] Sending PATCH request to ${API_URL}/api/v1/vendors/${vendorId}`);
    console.log("📦 [Step 4 Submission] Full payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/api/v1/vendors/${vendorId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

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
