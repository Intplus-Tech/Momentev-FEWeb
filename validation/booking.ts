import { z } from "zod";

/**
 * Booking form validation schema
 */
export const bookingEventDetailsSchema = z.object({
  title: z
    .string()
    .min(1, "Event title is required")
    .max(100, "Event title must be less than 100 characters"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      },
      { message: "Invalid start date" }
    )
    .refine(
      (date) => {
        const parsed = new Date(date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return parsed >= now;
      },
      { message: "Start date must be in the future" }
    ),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      },
      { message: "Invalid end date" }
    ),
  guestCount: z
    .number({
      message: "Guest count is required and must be a number",
    })
    .int("Guest count must be a whole number")
    .positive("Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

export const bookingBudgetAllocationSchema = z.object({
  vendorSpecialtyId: z.string().min(1, "Specialty is required"),
  budgetedAmount: z
    .number({
      message: "Budget amount is required and must be a number",
    })
    .positive("Budget amount must be greater than 0"),
});

export const bookingLocationSchema = z.object({
  addressText: z
    .string()
    .min(1, "Event location is required")
    .max(200, "Location must be less than 200 characters"),
});

export const createBookingSchema = z
  .object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    eventDetails: bookingEventDetailsSchema,
    budgetAllocations: z
      .array(bookingBudgetAllocationSchema)
      .min(1, "At least one service must be selected"),
    location: bookingLocationSchema,
    currency: z.string().min(1, "Currency is required"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.eventDetails.startDate);
      const endDate = new Date(data.eventDetails.endDate);
      return endDate >= startDate;
    },
    {
      message: "End date must be on or after start date",
      path: ["eventDetails", "endDate"],
    }
  );

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
export type BookingEventDetailsFormValues = z.infer<
  typeof bookingEventDetailsSchema
>;
export type BookingBudgetAllocationFormValues = z.infer<
  typeof bookingBudgetAllocationSchema
>;
