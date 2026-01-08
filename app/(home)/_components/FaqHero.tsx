"use client";

import { useState } from "react";
import { Plus, Minus, Home } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "What is Momentev?",
    answer:
      "Momentev is a managed, commission-based marketplace connecting clients with rigorously vetted event service vendors. We make it easy to find, compare, and book trusted professionals for your events.",
  },
  {
    question: "What is the 48-hour payout window?",
    answer:
      "The 48-hour payout window means that once your service is completed, your payment will be processed and available within 48 hours.",
  },
  {
    question: "How does the Vendor Ranking Score work?",
    answer:
      "The Vendor Ranking Score (VRS) is our proprietary scoring system calculated using reliability, customer reviews, booking volume, response time, and other quality metrics to help clients find the best vendors.",
  },
  {
    question: "What happens if something goes wrong with my booking?",
    answer:
      "If you experience any issues, you can raise a dispute within 48 hours of service completion. Our support team will review the case and work with both parties to find a fair resolution.",
  },
  {
    question: "Can I communicate with the vendor directly?",
    answer:
      "Yes! Once a booking is confirmed, you can communicate directly with the vendor through our in-app messaging system to discuss details and coordinate your event.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Absolutely. All payments are held in escrow via Stripe Connect until the service is completed and verified. This protects both clients and vendors throughout the transaction.",
  },
  {
    question: "How does payment work?",
    answer:
      "We offer flexible payment models including full upfront payment or deposit-based booking. All transactions are processed securely through Stripe.",
  },
  {
    question: "Can I sync my calendar to avoid double-booking?",
    answer:
      "Yes, vendors can sync their calendars to automatically update availability and prevent double-bookings across multiple platforms.",
  },
  {
    question: "How does commission work?",
    answer:
      "Momentev takes a small commission on each successful booking. This covers platform maintenance, payment processing, customer support, and marketing services.",
  },
];

export default function FaqHero() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#F0F0F0] min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4 text-primary" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">FAQ</span>
        </nav>

        {/* Header */}
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            Everything You Need to Know
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Got questions about using Momentev? Whether you&apos;re planning an
            event or offering your services as a vendor, we&apos;ve got you
            covered.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className="flex justify-between items-center w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base md:text-lg font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <span className="text-primary flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-5 pb-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
