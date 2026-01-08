"use client";

import { Home } from "lucide-react";
import Link from "next/link";

interface SectionItem {
  label?: string;
  text: string;
}

interface Section {
  id: string;
  title: string;
  content?: string;
  items?: SectionItem[];
}

const sections: Section[] = [
  {
    id: "introduction",
    title: "Introduction",
    content:
      "Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. By using our platform, you agree to the terms outlined here.",
  },
  {
    id: "information",
    title: "Information We Collect",
    items: [
      {
        label: "Personal Information",
        text: "Name, email, phone number, and other information you provide when registering or contacting us.",
      },
      {
        label: "Usage Data",
        text: "How you interact with our services, including pages visited, features used, and device information.",
      },
      {
        label: "Cookies & Tracking",
        text: "We use cookies and similar technologies to improve your experience.",
      },
    ],
  },
  {
    id: "usage",
    title: "How We Use Your Information",
    items: [
      { text: "To provide, maintain, and improve our services." },
      {
        text: "To communicate with you about updates, promotions, and support.",
      },
      { text: "To personalize your experience and provide relevant content." },
      { text: "To comply with legal obligations and prevent fraud." },
    ],
  },
  {
    id: "sharing",
    title: "How We Share Your Information",
    items: [
      { text: "We do not sell your personal information." },
      {
        text: "We may share information with trusted third-party service providers who help us operate our services.",
      },
      {
        text: "We may disclose information when required by law or to protect rights, safety, or property.",
      },
    ],
  },
  {
    id: "security",
    title: "Data Security",
    content:
      "We implement reasonable security measures to protect your data, but no method is 100% secure. We continuously work to improve our security practices.",
  },
  {
    id: "rights",
    title: "Your Rights",
    items: [
      { text: "Access, correct, or delete your personal data." },
      { text: "Opt out of promotional communications." },
      { text: "Contact us for questions about your privacy." },
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content:
      "We may update this policy from time to time. Changes will be posted here with the updated effective date.",
  },
  {
    id: "contact",
    title: "Contact Us",
    content:
      "For any questions about this Privacy Policy, please contact us at support@momentev.com.",
  },
];

export default function PrivacyHero() {
  return (
    <section className="bg-[#F0F0F0] min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4 text-primary" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">Privacy Policy</span>
        </nav>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <h2 className="font-semibold text-foreground">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
                Privacy Policy
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                At Momentev, we value your privacy and trust above all. This
                policy explains how we collect, use, and safeguard the
                information you share with us.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 2025
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 space-y-3"
                >
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">
                    {idx + 1}. {section.title}
                  </h2>
                  {section.content && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {section.items && (
                    <ul className="space-y-2 ml-5">
                      {section.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-sm md:text-base text-muted-foreground leading-relaxed list-disc"
                        >
                          {item.label && (
                            <span className="font-medium text-foreground">
                              {item.label}:{" "}
                            </span>
                          )}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
