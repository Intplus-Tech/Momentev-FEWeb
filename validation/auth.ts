import z from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(2, "Please enter your first name."),
  lastName: z.string().min(2, "Please enter your last name."),
  email: z.email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.email("Please use a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});