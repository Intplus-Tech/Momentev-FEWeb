"use client";

import { UpcomingEvents } from "./_components/upcoming-events";
import type { UpcomingEvent } from "./_components/upcoming-events";
import { RecommendedCategories } from "./_components/recommended-categories";
import type { RecommendedCategory } from "./_components/recommended-categories";

const upcomingEvents: UpcomingEvent[] = [
  {
    id: "sarah-james",
    title: "Sarah & James Wedding",
    vendor: "Elegant Weddings Photography",
    schedule: "Sat, 15 Jul 2025 at 2:00 PM",
    countdown: "(2 days)",
    financialLabel: "Balance due tomorrow:",
    financialValue: "£915",
    timeRange: "10:00-18:00",
    location: "St. Mary's Church, London",
    actions: ["Message Vendor"],
    ctaLabel: "Pay Balance",
  },
  {
    id: "office-party",
    title: "Office Christmas Party",
    vendor: "London Catering Co",
    schedule: "Sat, 15 Dec 2025 at 2:00 PM",
    countdown: "(49 days)",
    financialLabel: "Deposit Paid:",
    financialValue: "£1,000",
    timeRange: "10:00-18:00",
    location: "Grand Hotel Ballroom",
    actions: ["Message Vendor"],
    ctaLabel: "Pay Balance",
  },
];

const recommendedCategories: RecommendedCategory[] = [
  {
    title: "Florists",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&q=60",
  },
  {
    title: "Cake",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=640&q=60",
  },
  {
    title: "Transport",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=60",
  },
  {
    title: "Jewellery",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=640&q=60",
  },
];

export default function ClientDashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-base text-muted-foreground">
          Your Event Planning Hub
        </p>
      </div>

      <UpcomingEvents events={upcomingEvents} />

      <RecommendedCategories categories={recommendedCategories} />
    </section>
  );
}
