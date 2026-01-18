import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";

export const businessInfoSchema = z.object({
  // Company Information
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  yearsInBusiness: z.string().min(1, "Please select years in business"),
  companyRegistrationNumber: z
    .string()
    .min(1, "Company registration number is required"),
  businessRegistrationType: z
    .string()
    .min(1, "Please select business registration type"),
  businessDescription: z
    .string()
    .max(500, "Business description must not exceed 500 characters")
    .optional(),

  // Contact Information
  primaryContactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must not exceed 100 characters"),
  emailAddress: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().refine(
    (phone) => {
      try {
        const phoneNum = parsePhoneNumber(phone);
        return phoneNum?.isValid() ?? false;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid international phone number (e.g., +1 234 567 8900)" }
  ),
  meansOfIdentification: z.string().optional(),
  houseNumber: z.string().optional(),
  buildingNumber: z.string().optional(),
  streetAddress: z.string().optional(),
  zipCode: z.string().optional(),

  // Service Area
  serviceLocations: z
    .array(z.string())
    .min(1, "Please add at least one service location"),
  maximumTravelDistance: z.string().min(1, "Please select maximum travel distance"),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

export const yearsInBusinessOptions = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

export const businessRegistrationTypeOptions = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "cooperative", label: "Cooperative" },
  { value: "non-profit", label: "Non-Profit Organization" },
];

export const maximumTravelDistanceOptions = [
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
  { value: "150", label: "150 miles" },
  { value: "200+", label: "200+ miles" },
];
