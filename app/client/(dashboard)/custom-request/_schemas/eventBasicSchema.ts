import { z } from "zod";

export const eventBasicSchema = z
  .object({
    eventDate: z.string().min(1, "Please select a start date"),
    endDate: z.string().optional(),
    guestCount: z.number().min(1, "Guest count must be at least 1"),
    location: z.string().min(1, "Please enter a location"),
    eventName: z.string().min(1, "Please enter an event name"),
    eventDescription: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be at most 500 characters"),
  })
  .superRefine((data, context) => {
    if (!data.endDate) return;

    const startDate = new Date(data.eventDate);
    const endDate = new Date(data.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    if (endDate <= startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after the start date and time",
      });
    }
  });

export type EventBasicFormData = z.infer<typeof eventBasicSchema>;


