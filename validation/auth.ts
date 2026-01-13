import z from "zod";

export const clientSignUpSchema = z.object({
  firstName: z.string().min(1, "Please enter your first name."),
  lastName: z.string().min(1, "Please enter your last name."),
  email: z.email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const vendorSignUpSchema = z.object({
  companyName: z.string().min(2, "Please enter your company name."),
  email: z.email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// Keep signUpSchema as alias for vendorSignUpSchema for backward compatibility
export const signUpSchema = vendorSignUpSchema;

export const loginSchema = z.object({
  email: z.email("Please use a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});