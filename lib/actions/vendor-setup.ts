"use server";

import { fetchWithAuthRetry } from "@/lib/actions/auth-retry";
import { getUserProfile } from "@/lib/actions/user";
import { updateVendorOnboardingStage } from "@/lib/actions/vendor-profile";
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
 * Redact sensitive fields from an object for logging
 */
function redactSensitiveFields(data: any): any {
  if (!data) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(redactSensitiveFields);

  const sensitiveFields = [
    "emailAddress",
    "phoneNumber",
    "meansOfIdentification",
    "identification",
    "registration",
    "license",
    "contactInfo", // Often contains sensitive nested data
    "businessDocuments",
    "documents",
    "street",
  ];

  const result: any = { ...data };

  for (const key of Object.keys(result)) {
    if (sensitiveFields.includes(key)) {
      if (typeof result[key] === "string") {
        result[key] = "***REDACTED***";
      } else if (Array.isArray(result[key])) {
        result[key] = `[${result[key].length} items redacted]`;
      } else if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = "{ ... redacted object ... }";
      }
    } else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = redactSensitiveFields(result[key]);
    }
  }

  // Specific nested redaction for contactInfo if mostly keeping structure but hiding values
  if (data.contactInfo) {
    result.contactInfo = {
      ...data.contactInfo,
      emailAddress: data.contactInfo.emailAddress ? "***REDACTED***" : undefined,
      phoneNumber: data.contactInfo.phoneNumber ? "***REDACTED***" : undefined,
      meansOfIdentification: data.contactInfo.meansOfIdentification ? "***REDACTED***" : undefined,
    }
  }

  return result;
}

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
  const normalizedCompanyRegNo = formData.companyRegistrationNumber?.trim();
  const companyRegNoForApi = normalizedCompanyRegNo || "NOT_PROVIDED";

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
    businessName: formData.businessName,
    yearInBusiness: formData.yearsInBusiness, // Send as is (lowercase)
    // Keep client field optional while satisfying backend non-empty validation.
    companyRegNo: companyRegNoForApi,
    businessRegType: formData.businessRegistrationType, // Send as is (lowercase)
    businessDescription: formData.businessDescription,
    serviceArea: {
      travelDistance:
        formData.maximumTravelDistance === "200+"
          ? "200+ miles"
          : `${formData.maximumTravelDistance} miles`,
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
    console.log('📋 [Step 1 Submission] Form data:', JSON.stringify(redactSensitiveFields(formData), null, 2));

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

    // Check if vendor already has an address linked to their business profile to avoid duplicates
    const existingBusinessProfile = profileResult.data.vendor?.businessProfile;
    // Handle both populated object and direct ID string cases
    let existingAddressId: string | undefined;

    if (existingBusinessProfile && existingBusinessProfile.contactInfo && existingBusinessProfile.contactInfo.addressId) {
      const addrId = existingBusinessProfile.contactInfo.addressId;
      if (typeof addrId === 'string') {
        existingAddressId = addrId;
      } else if (typeof addrId === 'object' && addrId._id) {
        existingAddressId = addrId._id;
      }
    }

    // Checking for existing personal address to link if business address doesn't exist yet
    if (!existingAddressId && profileResult.data.addressId) {
      const personalAddrId = profileResult.data.addressId;
      if (typeof personalAddrId === 'string') {
        existingAddressId = personalAddrId;
        console.log(`🔗 [Step 1 Submission] Found existing personal address: ${existingAddressId}. Linking business profile to it.`);
      } else if (typeof personalAddrId === 'object' && personalAddrId._id) {
        existingAddressId = personalAddrId._id;
        console.log(`🔗 [Step 1 Submission] Found existing personal address: ${existingAddressId}. Linking business profile to it.`);
      }
    }

    // Link an existing address if one is already available on the profile.
    // Step 1 no longer collects address fields, so we do not create/update
    // an address here.
    let addressId: string | undefined = existingAddressId;

    const payload = transformFormToPayload(formData, vendorId, addressId, documents);
    console.log('🔄 [Step 1 Submission] Transformed payload:', JSON.stringify(redactSensitiveFields(payload), null, 2));

    console.log(`🌐 [Step 1 Submission] Sending POST request to ${API_URL}/api/v1/business-profiles`);

    const { response, error, errorCode, token } = await fetchWithAuthRetry((authToken) =>
      fetch(`${API_URL}/api/v1/business-profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })
    );

    if (!response) {
      console.error('❌ [Step 1 Submission] Authentication failed:', error);
      return {
        success: false,
        error: error || "Authentication required",
      };
    }

    console.log(`📡 [Step 1 Submission] Response status: ${response.status} ${response.statusText}`);

    if (errorCode === 'FORBIDDEN') {

      return { success: false, error: "You do not have permission to perform this action." };

    }


    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ [Step 1 Submission] Unauthorized (401)');
        return { success: false, error: "Unauthorized" };
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ [Step 1 Submission] Validation error (400):', JSON.stringify(redactSensitiveFields(errorData), null, 2));
        return {
          success: false,
          error: errorData?.message || "Validation error",
        };
      }
      if (response.status === 409) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ [Step 1 Submission] Conflict error (409):', JSON.stringify(redactSensitiveFields(errorData), null, 2));
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
    console.log('✅ [Step 1 Submission] Success! Response data:', JSON.stringify(redactSensitiveFields(data), null, 2));

    // Update onboarding stage to 1 (Service Setup)
    console.log('📋 [Step 1 Submission] Incrementing onboarding stage to 1...');
    const stageUpdateResult = await updateVendorOnboardingStage(1, {
      vendorId,
      accessToken: token,
    });

    if (!stageUpdateResult.success) {
      console.warn('⚠️ [Step 1 Submission] Warning: Failed to update onboarding stage:', stageUpdateResult.error);
      // Continue anyway - stage update is secondary to business info submission
    } else {
      console.log('✅ [Step 1 Submission] Onboarding stage successfully updated to 1');
    }

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
