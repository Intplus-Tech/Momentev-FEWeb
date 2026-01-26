import { z } from "zod";

// Additional Fee Schema
const additionalFeeSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
});

export const pricingStructureSchema = z.object({
  // Pricing Configuration
  pricingType: z.enum(["hourly", "custom"], {
    message: "Please select how you charge",
  }),

  // Hourly Rate (conditional)
  hourlyRate: z.string().optional(),

  // Transport Fee (Compulsory)
  transportFee: z.object({
    type: z.enum(["flat_50", "per_mile_1", "custom"], {
      message: "Please select a transport fee option",
    }),
    amount: z.string().optional(),
  }).refine((data) => {
    if (data.type === "custom") {
      return !!data.amount && data.amount.trim() !== "";
    }
    return true;
  }, {
    message: "Please enter the custom amount",
    path: ["amount"],
  }),

  // Additional Fees
  additionalFees: z.array(additionalFeeSchema).optional(),
}).refine((data) => {
  // If hourly, require hourly rate
  if (data.pricingType === "hourly") {
    return !!data.hourlyRate;
  }
  return true;
}, {
  message: "Please enter your hourly rate",
  path: ["hourlyRate"],
});

export type PricingStructureFormData = z.infer<typeof pricingStructureSchema>;
export type AdditionalFee = z.infer<typeof additionalFeeSchema>;
