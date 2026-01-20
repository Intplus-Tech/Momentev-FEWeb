import { z } from "zod";

// Package Feature Schema
const packageFeatureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
});

// Package Schema
const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  price: z.string().min(1, "Price is required"),
  features: z.array(packageFeatureSchema).min(1, "At least one feature is required"),
});

// Equipment Fee Schema
const equipmentFeeSchema = z.object({
  name: z.string().min(1, "Equipment name is required"),
  price: z.string().optional(),
});

export const pricingStructureSchema = z.object({
  // Pricing Configuration
  pricingType: z.enum(["hourly", "package", "custom"], {
    required_error: "Please select how you charge",
  }),

  // Hourly Rate (conditional)
  hourlyRate: z.string().optional(),
  minimumHours: z.string().optional(),

  // Packages (conditional)
  packages: z.array(packageSchema).optional(),

  // Additional Fees
  travelFee: z.string().min(1, "Please select travel fee option"),
  leadTimeRequired: z.string().min(1, "Please select lead time"),
  maximumEventSize: z.string().min(1, "Please select maximum event size"),

  // Equipment Fees
  equipmentFees: z.array(equipmentFeeSchema).optional(),
}).refine((data) => {
  // If hourly, require hourly rate and minimum hours
  if (data.pricingType === "hourly") {
    return !!data.hourlyRate && !!data.minimumHours;
  }
  // If package, require at least one package
  if (data.pricingType === "package") {
    return !!data.packages && data.packages.length > 0;
  }
  return true;
}, {
  message: "Please complete all required pricing fields",
  path: ["pricingType"],
});

export type PricingStructureFormData = z.infer<typeof pricingStructureSchema>;
export type PackageFeature = z.infer<typeof packageFeatureSchema>;
export type Package = z.infer<typeof packageSchema>;
export type EquipmentFee = z.infer<typeof equipmentFeeSchema>;
