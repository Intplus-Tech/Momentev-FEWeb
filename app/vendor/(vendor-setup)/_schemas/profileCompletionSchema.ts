import { z } from "zod";

// Social media link schema
export const socialMediaLinkSchema = z.object({
  name: z.string().min(1, "Platform name is required"),
  link: z.string().url("Please enter a valid URL"),
});

export type SocialMediaLink = z.infer<typeof socialMediaLinkSchema>;

export const profileCompletionSchema = z.object({
  // Profile Media Upload
  profilePhoto: z.string().min(1, "Please upload a profile photo"),
  coverPhoto: z.string().min(1, "Please upload a cover photo"),
  portfolioGallery: z.array(z.string()).min(5, "Please upload at least 5 portfolio photos"),
  // Social Media Links (optional)
  socialMediaLinks: z.array(socialMediaLinkSchema).optional(),
});

export type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;

// Predefined social media platform options
export const SOCIAL_MEDIA_PLATFORMS = [
  { value: "website", label: "Website", placeholder: "https://yourwebsite.com" },
  { value: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { value: "facebook", label: "Facebook", placeholder: "https://facebook.com/page" },
  { value: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
  { value: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { value: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { value: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/username" },
  { value: "threads", label: "Threads", placeholder: "https://threads.net/@username" },
  { value: "custom", label: "Other (Custom)", placeholder: "https://..." },
] as const;
