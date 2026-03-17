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

const MIN_WORD_COUNT = 10;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s'\-]+$/, "Name must contain only letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (val) => {
        const domain = val.split("@")[1]?.toLowerCase();
        if (!domain) return false;
        // reject obviously invalid domains (must have a dot and a valid TLD)
        return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
      },
      "Please enter a valid email domain"
    ),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
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

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    reset();
    toast.success("Sent Successfully", {
      description: "We'll get back to you as soon as possible.",
    });
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
                Let&apos;s Talk
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="h-12"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  className="h-12"
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject.message}</p>
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
