import { z } from "zod";

export const paymentConfigurationSchema = z.object({
  // Section 1: Payment Model Selection
  paymentModel: z.enum(["upfront", "split"], {
    required_error: "Please select a payment model",
  }),

  // Section 2: Stripe Connect
  stripeConnected: z.boolean().default(false),
  stripeAccountId: z.string().optional(),

  // Section 3: Commission Agreement
  commissionAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the commission terms",
  }),
});

export type PaymentConfigurationFormData = z.infer<typeof paymentConfigurationSchema>;
