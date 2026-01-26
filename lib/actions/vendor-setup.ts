"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";
import { createAddress } from "@/lib/actions/address";
import type {
  BusinessProfilePayload,
  BusinessProfileResponse,
} from "@/types/vendor";
import type { BusinessInfoFormData } from "@/app/vendor/(vendor-setup)/_schemas/businessInfoSchema";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Transform form data to API payload format
 */
function transformFormToPayload(
  formData: BusinessInfoFormData,
  vendorId: string,
  addressId?: string,
  documents?: {
    identification?: string[];
    registration?: string[];
    license?: string[];
  },
): BusinessProfilePayload {
  // Transform working days to workdays array
  const workdays = Object.entries(formData.workingDays)
    .filter(([_, isSelected]) => isSelected)
    .map(([day, _]) => ({
      dayOfWeek: day.toLowerCase(),
      open: formData.workingHoursStart,
      close: formData.workingHoursEnd,
    }));

  // Map documents with correct names
  const businessDocuments: { docName: string; file: string }[] = [];

  if (documents?.identification) {
    documents.identification.forEach(id => {
      businessDocuments.push({ docName: "Identification", file: id });
    });
  }

  if (documents?.registration) {
    documents.registration.forEach(id => {
      businessDocuments.push({ docName: "Registration", file: id });
    });
  }

  if (documents?.license) {
    documents.license.forEach(id => {
      businessDocuments.push({ docName: "License", file: id });
    });
  }

  return {
    vendorId, // Include vendorId from user profile
    contactInfo: {
      primaryContactName: formData.primaryContactName,
      emailAddress: formData.emailAddress,
      phoneNumber: formData.phoneNumber,
      meansOfIdentification: formData.meansOfIdentification,
      addressId, // Include addressId if address was created
    },
    businessName: formData.businessName,
    yearInBusiness: formData.yearsInBusiness, // Send as is (lowercase)
    companyRegNo: formData.companyRegistrationNumber,
    businessRegType: formData.businessRegistrationType, // Send as is (lowercase)
    businessDescription: formData.businessDescription,
    serviceArea: {
      travelDistance: `${formData.maximumTravelDistance}km`,
      areaNames: formData.serviceLocations.map((location) => ({
        city: location.city.toLowerCase(),
        state: location.state.toLowerCase(),
        country: location.country || "NG",
      })),
    },
    workdays, // Include workdays array
    businessDocuments: businessDocuments.length > 0 ? businessDocuments : undefined,
  };
}

/**
 * Submit business information (Step 1) to create/update vendor profile
 */
export async function submitBusinessInformation(
  formData: BusinessInfoFormData,
  documents?: {
    identification?: string[];
    registration?: string[];
    license?: string[];
  },
): Promise<ActionResponse<BusinessProfileResponse>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }
  try {
    console.log('📤 [Step 1 Submission] Starting business information submission...');
    console.log('📋 [Step 1 Submission] Form data:', JSON.stringify(formData, null, 2));

    // First, get user profile to extract vendorId
    const profileResult = await getUserProfile();

    if (!profileResult.success || !profileResult.data) {
      console.error('❌ [Step 1 Submission] Failed to get user profile:', profileResult.error);
      return {
        success: false,
        error: profileResult.error || "Failed to get user profile",
      };
    }

    const vendorId = profileResult.data.vendor?._id;

    if (!vendorId) {
      console.error('❌ [Step 1 Submission] No vendor ID found in user profile');
      return {
        success: false,
        error: "No vendor ID found. Please ensure you have a vendor account.",
      };
    }

    console.log(`🎫 [Step 1 Submission] Vendor ID: ${vendorId}`);

    // Create address if address fields are provided
    let addressId: string | undefined;

    if (formData.street || formData.city || formData.state || formData.postalCode) {
      console.log('🏠 [Step 1 Submission] Creating address...');

      const addressResult = await createAddress({
        street: formData.street || '',
        city: formData.city || '',
        state: formData.state || '',
        postalCode: formData.postalCode || '',
        country: formData.country || 'NG', // Use form country or default to NG
      });

      if (addressResult.success && addressResult.data) {
        addressId = addressResult.data._id;
        console.log(`✅ [Step 1 Submission] Address created: ${addressId}`);
      } else {
        console.warn('⚠️ [Step 1 Submission] Address creation failed:', addressResult.error);
        // Continue without address - it's optional
      }
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error('❌ [Step 1 Submission] No access token found');
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const payload = transformFormToPayload(formData, vendorId, addressId, documents);
    console.log('🔄 [Step 1 Submission] Transformed payload:', JSON.stringify(payload, null, 2));

    console.log(`🌐 [Step 1 Submission] Sending POST request to ${API_URL}/api/v1/business-profiles`);

    const response = await fetch(`${API_URL}/api/v1/business-profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.log(`📡 [Step 1 Submission] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ [Step 1 Submission] Unauthorized (401)');
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ [Step 1 Submission] Validation error (400):', JSON.stringify(errorData, null, 2));
        return {
          success: false,
          error: errorData?.message || "Validation error",
        };
      }
      if (response.status === 409) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ [Step 1 Submission] Conflict error (409):', JSON.stringify(errorData, null, 2));
        return {
          success: false,
          error: errorData?.message || "Conflict error: Resource already exists",
        };
      }
      console.error(`❌ [Step 1 Submission] API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Failed to submit business information: ${response.statusText}`,
      };
    }

    const data: BusinessProfileResponse = await response.json();
    console.log('✅ [Step 1 Submission] Success! Response data:', JSON.stringify(data, null, 2));

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("💥 [Step 1 Submission] Exception caught:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
