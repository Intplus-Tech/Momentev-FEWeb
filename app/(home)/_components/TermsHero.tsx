"use client";

import { Home } from "lucide-react";
import Link from "next/link";

const definitions = [
  {
    term: "Platform",
    definition:
      "refers to all Momentev websites, mobile apps, portals, dashboards, messaging systems, microservices, technology systems, and integrations.",
  },
  {
    term: "Client",
    definition: "refers to any user seeking or booking event-related services.",
  },
  {
    term: "Vendor",
    definition:
      "refers to event service providers using the Vendor Portal to manage listings, receive bookings, and process payouts.",
  },
  {
    term: "Booking",
    definition:
      "refers to any engagement between a Client and Vendor initiated through the Platform.",
  },
  {
    term: "Deposit",
    definition:
      "refers to the initial payment required for certain payment models.",
  },
  {
    term: "Balance Payment",
    definition: "refers to the remaining amount due for a Booking.",
  },
  {
    term: "Escrow",
    definition:
      "refers to the financial holding system managed by Momentev via Stripe Connect.",
  },
  {
    term: "Vendor Ranking Score (VRS)",
    definition:
      "refers to Momentev's proprietary score calculated using reliability, reviews, volume, and other metrics.",
  },
];

const sections = [
  {
    id: "definitions",
    title: "Definitions",
    type: "definitions",
  },
  {
    id: "about",
    title: "About Momentev",
    content:
      "Momentev is a managed marketplace that connects clients with verified event service providers. We facilitate bookings, payments, and communications between parties.",
  },
  {
    id: "registration",
    title: "Account Registration & Eligibility",
    items: [
      "You must be at least 18 years old to use Momentev.",
      "You agree to provide accurate and complete registration information.",
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You must notify us immediately of any unauthorized use of your account.",
    ],
  },
  {
    id: "platform-use",
    title: "Use of the Platform",
    items: [
      "Use the Platform only for lawful purposes and in accordance with these Terms.",
      "Not engage in any conduct that restricts or inhibits others from using the Platform.",
      "Not attempt to gain unauthorized access to any part of the Platform.",
      "Not use automated systems to access the Platform without our permission.",
    ],
  },
  {
    id: "vendor-listings",
    title: "Vendor Listings, Pricing & Availability",
    content:
      "Vendors are responsible for the accuracy of their listings, including pricing, availability, and service descriptions. Momentev reserves the right to remove listings that violate our guidelines.",
  },
  {
    id: "bookings",
    title: "Quotes, Bookings & Deposits",
    content:
      "Clients can request quotes from vendors. Once a quote is accepted, a booking is created. Deposits may be required based on the vendor's payment preferences and the total booking value.",
  },
  {
    id: "payments",
    title: "Payment Models & Escrow",
    content:
      "All payments are processed through Stripe Connect. Funds are held in escrow until the service is completed and the 48-hour dispute window has passed. Vendors receive payouts within 48 hours of service completion.",
  },
  {
    id: "disputes",
    title: "Disputes & Refunds",
    content:
      "Clients have 48 hours after service completion to raise disputes. Our support team reviews all disputes and determines appropriate resolutions, which may include partial or full refunds.",
  },
];

export default function TermsHero() {
  return (
    <section className="bg-[#F0F0F0] min-h-screen py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4 text-primary" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">
            Terms of Service
          </span>
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
                Terms of Service
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Welcome to Momentev, a managed, commission-based marketplace
                connecting clients with rigorously vetted event service vendors.
                These Terms govern your access and use of the Platform.
              </p>
              <p className="text-sm font-medium text-foreground">
                By accessing or using Momentev, you agree to be bound by these
                Terms, as well as our Privacy Policy.
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

                  {section.type === "definitions" && (
                    <div className="space-y-3">
                      <p className="text-sm md:text-base text-muted-foreground">
                        For the purpose of these terms:
                      </p>
                      <ul className="space-y-2 ml-5">
                        {definitions.map((def, defIdx) => (
                          <li
                            key={defIdx}
                            className="text-sm md:text-base text-muted-foreground leading-relaxed list-disc"
                          >
                            <span className="font-semibold text-foreground">
                              {def.term}
                            </span>{" "}
                            {def.definition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                          {item}
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
