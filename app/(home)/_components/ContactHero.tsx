"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Mail, Phone, Instagram, Twitter, Facebook, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { createSupportRequest } from "@/lib/actions/support";

const MIN_WORD_COUNT = 10;

const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s'\-]+$/, "First name must contain only letters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s'\-]+$/, "Last name must contain only letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (val) => {
        const domain = val.split("@")[1]?.toLowerCase();
        if (!domain) return false;
        return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
      },
      "Please enter a valid email domain"
    ),
  message: z
    .string()
    .min(1, "Message is required")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= MIN_WORD_COUNT,
      `Message must be at least ${MIN_WORD_COUNT} words`
    ),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactHero() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const messageValue = watch("message") ?? "";
  const wordCount = messageValue.trim().split(/\s+/).filter(Boolean).length;

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createSupportRequest(data);
      if (result.success) {
        reset();
        toast.success("Message sent successfully", {
          description: "We'll get back to you as soon as possible.",
        });
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4 text-primary" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">Contact</span>
        </nav>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left - Info */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                Get in Touch
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Have a question, suggestion, or need support? Reach out to us
                and our team will get back to you promptly.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Support</h2>
              <div className="space-y-2">
                <a
                  href="mailto:support@momentev.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@momentev.com
                </a>
                <a
                  href="tel:+447873371393"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +44 787 337 1393
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Socials</h2>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-2 bg-white rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    className="h-12"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    className="h-12"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="h-12"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message</Label>
                  <span
                    className={`text-xs ${
                      wordCount >= MIN_WORD_COUNT
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {wordCount} / {MIN_WORD_COUNT} words minimum
                  </span>
                </div>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  className="min-h-[150px] resize-none"
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
