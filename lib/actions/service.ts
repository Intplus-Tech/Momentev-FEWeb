"use server";

import { getAccessToken } from "@/lib/session";
import { getUserProfile } from "@/lib/actions/user";
import { advanceVendorOnboarding } from "@/lib/actions/vendor-profile";
import { majorToMinor } from "@/lib/currency";
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

const toMinorPriceString = (value: unknown) => String(majorToMinor(value as number | string | null | undefined));

const SERVICE_FIELD_LABELS: Record<string, string> = {
  minimumBookingDuration: "Minimum booking duration",
  leadTimeRequired: "Lead time required",
  maximumEventSize: "Maximum event size",
};

function formatFieldList(fields: string[]): string {
  if (fields.length < 2) return fields[0] ?? "service details";
  if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
  return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`;
}

function getFriendlyFieldLabel(field: string): string {
  return SERVICE_FIELD_LABELS[field] ??
    field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^\w/, (letter) => letter.toUpperCase());
}

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
    const additionalFees: { name: string; price: string; feeCategory: string }[] = [];

    // Helper: sanitize price strings (remove currency symbols, commas)
    const sanitizePrice = (val: any) => {
      if (val === null || val === undefined) return "0";
      const s = String(val);
      const cleaned = s.replace(/[^0-9.]/g, "");
      return cleaned === "" ? "0" : cleaned;
    };

    // Add Transport Fee
    if (pricingData.transportFee?.type) {
      let price = "0";
      let name = "Transport Fee";

      if (pricingData.transportFee.type === "flat_50") {
        price = toMinorPriceString(50);
        name = "Transport Fee (Flat)";
      } else if (pricingData.transportFee.type === "per_mile_1") {
        price = toMinorPriceString(1);
      } else if (pricingData.transportFee.type === "custom") {
        price = toMinorPriceString(sanitizePrice(pricingData.transportFee.amount));
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
        price: toMinorPriceString(sanitizePrice(fee.price)),
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

    // console.log("Creating Vendor Service...", servicePayload);
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
        const invalidFields = Object.keys(err.errors.body.fieldErrors);
        if (invalidFields.length > 0) {
          const labels = invalidFields.map(getFriendlyFieldLabel);
          errorMessage = `Please review these service details: ${formatFieldList(labels)}.`;
        }
      }

      return { success: false, error: errorMessage };
    }

    // 2. Create Vendor Specialties
    // Determine base price from pricing structure (sanitize to plain numeric string)
    let basePrice = "0";
    let priceCharge = "custom_quotes";

    if (pricingData.pricingType === "hourly") {
      basePrice = toMinorPriceString(sanitizePrice(pricingData.hourlyRate));
      priceCharge = "hourly_rate";
    }
    // Custom is default "custom_quotes" with price "0"

    // console.log(`Creating ${serviceData.specialties.length} Specialties...`);

    const specialtyPromises = serviceData.specialties.map(specialtyId => {
      const bodyPayload = {
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
        body: JSON.stringify(bodyPayload),
      }).then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error(`Failed to create specialty ${specialtyId}:`, JSON.stringify(err, null, 2));
          console.error("Payload sent:", JSON.stringify(bodyPayload));
          throw new Error(err.message || "Failed to create specialty");
        }
        return res.json();
      });
    });

    await Promise.all(specialtyPromises);

    // Update onboarding stage to 2 (Payment Setup)
    const stageUpdateResult = await advanceVendorOnboarding({
      vendorId,
      accessToken,
    });

    if (!stageUpdateResult.success) {
      console.warn('⚠️ [Step 2 Submission] Warning: Failed to update onboarding stage:', stageUpdateResult.error);
      // Continue anyway - stage update is secondary to service setup submission
    }

    return { success: true };

  } catch (error) {
    console.error("Submit Service Setup Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
