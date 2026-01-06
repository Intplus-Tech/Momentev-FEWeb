"use client";

import { Home } from "lucide-react";

export default function TermsHero() {
  return (
    <section className="bg-gray-200 flex flex-col items-center min-h-screen overflow-x-hidden">
      <div className="flex flex-col items-center py-20 px-4 sm:px-10 md:px-[140px] space-y-20 w-full">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-5 text-sm sm:text-base w-full max-w-[1026px]">
          <button>
            <Home className="text-primary" />
          </button>
          <p>/</p>
          <button className="text-[#142141]">Search</button>
          <p>/</p>
          <button className="font-semibold">Terms of Services</button>
        </div>

        {/* Content */}
        <div className="w-full max-w-[1026px] space-y-5">
          <div className="flex flex-col lg:flex-row lg:space-x-20 space-y-10 lg:space-y-0">

            {/* Table of Content */}
            <div className="space-y-5 w-full lg:w-auto">
              <h2>Table of Content</h2>
              <div>Definition</div>
              <div>About Momentev</div>
              <div>Account Registeration & Eligibility</div>
              <div>Use of the platform</div>
              <div>Vendor Listings, Pricing & Availability</div>
              <div>Quotes, Bookings & Deposits</div>
              <div>Payment Models & Escrow</div>
              <div>Disputes & Refunds</div>
            </div>

            {/* Main Policy Content */}
            <div className="w-full lg:w-[726px] space-y-5">
              <div className="space-y-5">
                <h2 className="text-[#0F0202] text-[30px]">
                  Terms of Services - Momentev
                </h2>

                <p>
                  Welcome to Momentev, a managed, commission-based marketplace
                  connecting clients with rigorously vetted event service vendors.
                  These Terms of Service (“Terms”) govern your access and use of the
                  Momentev mobile applications, vendor portal, client web portal,
                  landing website, administrative interfaces, and all related
                  features, services, and technologies (collectively, the
                  “Platform”).
                </p>

                <p className="font-semibold">
                  By accessing or using Momentev, you agree to be bound by these
                  Terms, as well as our Privacy Policy and any applicable
                  supplemental policies that may apply to your use of specific
                  features of the Platform.
                </p>

                <p>
                  If you do not agree with these <strong>Terms</strong>, you may not
                  access or use the Platform.
                </p>
              </div>

              <ol className="space-y-5">
                <li>
                  <h4 className="font-semibold">1.Definitions</h4>
                  <p className="p-3">For the purpose of these terms:</p>
                  <ul className="list-disc pl-20 space-y-2 w-full lg:w-[676px]">

                    <li>
                      <strong>Platform</strong> refers to all Momentev websites, mobile apps, portals, dashboards, messaging systems, microservices, technology systems, and integrations.
                    </li>
                    <li>
                      <strong>Client</strong> refers to any user seeking or booking event-related services.
                    </li>
                    <li>
                      <strong>Vendor </strong>refers to event service providers using the Vendor Portal to manage       listings, receive bookings, and process payouts.
                    </li>
                    <li>
                      <strong>Booking</strong> refers to any engagement between a Client and Vendor initiated through the Platform.
                    </li>
                    <li>
                      <strong>Deposit</strong> refers to the initial payment required for certain payment models.
                    </li>
                    <li>
                      <strong>Balance Payment </strong>refers to the remaining amount due for a Booking.
                    </li>
                    <li>
                      <strong>Escrow</strong> refers to the financial holding system managed by Momentev <span>via Stripe Connect.</span>
                    </li>
                    <li>
                      <strong>Vendor Ranking Score (VRS)</strong> refers to Momentev’s proprietary score calculated using reliability, reviews, volume, and other metrics.
                    </li>
                    <li>
                      <strong>Service Catalog</strong> refers to the Vendor’s publicly displayed listing including pricing, availability, service description, and media.
                    </li>
                    <li>
                      <strong>Open Request</strong> refers to a Client-initiated request for quotes on items or services not explicitly listed.
                    </li>
                    <li>
                      <strong>Dispute Window or 48-Hour Window</strong> refers to the period during which a Client may dispute a completed service before payout release.
                    </li>
                  </ul>
                </li>
                <p><strong>2.About Momentev</strong></p>
              
                
                
               

                
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
