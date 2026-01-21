import { z } from "zod";

export const serviceCategoriesSchema = z.object({
  // What Do You Offer?
  serviceCategory: z.string().min(1, "Please select a service category"),

  // Specialties (multi-select)
  specialties: z.array(z.string()).min(1, "Please select at least one specialty"),

  // Service Details
  minimumBookingDuration: z.string().min(1, "Please select minimum booking duration"),
  leadTimeRequired: z.string().min(1, "Please select lead time required"),
  maximumEventSize: z.string().min(1, "Please select maximum event size"),

  // Keywords/Tags
  keywords: z.array(z.string()).optional(),
});

export type ServiceCategoriesFormData = z.infer<typeof serviceCategoriesSchema>;
