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
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Service Area
  // Service Area
  serviceLocations: z
    .array(
      z.object({
        city: z.string(),
        state: z.string(),
        country: z.string(),
      })
    )
    .min(1, "Please add at least one service location"),
  maximumTravelDistance: z.string().min(1, "Please select maximum travel distance"),

  // Availability
  workingDays: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),
  workingHoursStart: z.string().min(1, "Please select start time"),
  workingHoursEnd: z.string().min(1, "Please select end time"),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

// Years in Business - Matching likely API Enums based on example "1_3_YEARS"
export const yearsInBusinessOptions = [
  { value: "less_than_1_year", label: "Less than 1 year" },
  { value: "1_3_years", label: "1-3 years" },
  { value: "3_5_years", label: "3-5 years" },
  { value: "5_10_years", label: "5-10 years" },
  { value: "more_than_10_years", label: "More than 10 years" },
];

export const businessRegistrationTypeOptions = [
  { value: "company", label: "Company" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" }, // Changed from sole_trader
  { value: "partnership", label: "Partnership" },
  { value: "limited_liability_partnership", label: "Limited Liability Partnership (LLP)" },
];

export const maximumTravelDistanceOptions = [
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
  { value: "150", label: "150 miles" },
  { value: "200+", label: "200+ miles" },
];
