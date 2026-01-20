import { z } from "zod";

export const profileCompletionSchema = z.object({
  // Profile Media Upload
  profilePhoto: z.string().optional(),
  coverPhoto: z.string().optional(),
  portfolioGallery: z.array(z.string()).min(5, "Please upload at least 5 portfolio photos"),

  // Availability Settings
  workingDays: z.object({
    monday: z.boolean().default(true),
    tuesday: z.boolean().default(true),
    wednesday: z.boolean().default(true),
    thursday: z.boolean().default(true),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  }),
  workingHoursStart: z.string().min(1, "Please select start time"),
  workingHoursEnd: z.string().min(1, "Please select end time"),
});

export type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;
