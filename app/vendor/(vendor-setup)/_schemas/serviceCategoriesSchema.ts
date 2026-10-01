import { z } from "zod";

export const serviceCategoriesSchema = z.object({
  // What Do You Offer?
  serviceCategory: z.string().min(1, "Please select a service category"),

  // Specialties (multi-select)
  specialties: z.array(z.string()).min(1, "Please select at least one specialty"),

  // Service Details
  minimumBookingDuration: z.enum(
    ["two_hours", "an_hour", "four_hours", "full_day"],
    { message: "Please select a valid minimum booking duration." },
  ),
  leadTimeRequired: z.enum(
    ["two_weeks", "a_week", "four_weeks", "flexible"],
    { message: "Please select a valid lead time." },
  ),
  maximumEventSize: z.enum(
    ["unlimited", "fifty_guest", "hundred_guest", "two_hundred_guest"],
    { message: "Please select a valid maximum event size." },
  ),

  // Keywords/Tags
  keywords: z.array(z.string()).optional(),
});

export type ServiceCategoriesFormData = z.infer<typeof serviceCategoriesSchema>;
