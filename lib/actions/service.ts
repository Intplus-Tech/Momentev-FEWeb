"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";
import type {
  ServiceCategoriesFormData,
} from "@/app/vendor/(vendor-setup)/_schemas/serviceCategoriesSchema";
import type {
  PricingStructureFormData,
} from "@/app/vendor/(vendor-setup)/_schemas/pricingStructureSchema";

const API_URL = process.env.BACKEND_URL;

type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Submit service setup (Step 2)
 * Creates vendor service and vendor specialties
 */
export async function submitServiceSetup(
  serviceData: ServiceCategoriesFormData,
  pricingData: PricingStructureFormData
): Promise<ActionResponse> {
  if (!API_URL) return { success: false, error: "Backend URL not configured" };

  try {
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data?.vendor?._id) {
      return { success: false, error: "Vendor profile not found" };
    }
    const vendorId = profileResult.data.vendor._id;
    const accessToken = await getAccessToken();

    if (!accessToken) return { success: false, error: "Authentication required" };

    // 1. Prepare Vendor Service Payload
    const additionalFees = [];

    // Add Transport Fee
    if (pricingData.transportFee?.type) {
      let price = "0";
      let name = "Transport Fee";

      if (pricingData.transportFee.type === "flat_50") {
        price = "50";
        name = "Transport Fee (Flat)";
      } else if (pricingData.transportFee.type === "per_mile_1") {
        price = "1";
        name = "Transport Fee (Per Mile)";
      } else if (pricingData.transportFee.type === "custom") {
        price = pricingData.transportFee.amount || "0";
        name = "Transport Fee (Custom)";
      }

      additionalFees.push({
        name,
        price,
        feeCategory: "travel",
      });
    }

    // Add other additional fees
    if (pricingData.additionalFees) {
      additionalFees.push(...pricingData.additionalFees.map(fee => ({
        name: fee.name,
        price: fee.price,
        feeCategory: fee.category
      })));
    }

    const servicePayload = {
      vendorId,
      serviceCategory: serviceData.serviceCategory,
      tags: serviceData.keywords || [],
      minimumBookingDuration: serviceData.minimumBookingDuration,
      leadTimeRequired: serviceData.leadTimeRequired,
      maximumEventSize: serviceData.maximumEventSize,
      additionalFees: additionalFees.length > 0 ? additionalFees : undefined,
    };

    console.log("Creating Vendor Service...", servicePayload);
    const serviceRes = await fetch(`${API_URL}/api/v1/vendor-services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(servicePayload),
    });

    if (!serviceRes.ok) {
      const err = await serviceRes.json().catch(() => ({}));
      console.error("Failed to create vendor service detailed error:", JSON.stringify(err, null, 2));

      let errorMessage = err.message || "Failed to create service";

      if (err.errors?.body?.fieldErrors) {
        const fieldErrors = err.errors.body.fieldErrors;
        const detailedErrors = Object.entries(fieldErrors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
          .join("; ");
        if (detailedErrors) {
          errorMessage = `Validation failed: ${detailedErrors}`;
        }
      }

      return { success: false, error: errorMessage };
    }

    // 2. Create Vendor Specialties
    // Determine base price from pricing structure
    let basePrice = "0";
    let priceCharge = "custom_quote";

    if (pricingData.pricingType === "hourly") {
      basePrice = pricingData.hourlyRate || "0";
      priceCharge = "hourly_rate";
    }
    // Custom is default "custom_quote" with price "0"

    console.log(`Creating ${serviceData.specialties.length} Specialties...`);

    const specialtyPromises = serviceData.specialties.map(specialtyId => {
      const payload = {
        vendorId,
        serviceSpecialty: specialtyId,
        priceCharge,
        price: basePrice,
      };

      return fetch(`${API_URL}/api/v1/vendor-specialties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }).then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error(`Failed to create specialty ${specialtyId}:`, err);
          throw new Error(err.message || "Failed to create specialty");
        }
        return res.json();
      });
    });

    await Promise.all(specialtyPromises);

    return { success: true };

  } catch (error) {
    console.error("Submit Service Setup Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
