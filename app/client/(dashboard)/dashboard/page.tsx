"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const upcomingEvents = [
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
    actions: ["View Details", "Message Vendor"],
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
    actions: ["View Details", "Message Vendor"],
    ctaLabel: "Pay Balance",
  },
];

const recommendedCategories = [
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
  const [openEventId, setOpenEventId] = useState<string | null>(
    upcomingEvents[0]?.id ?? null
  );

  const toggleEvent = (id: string) => {
    setOpenEventId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-base text-muted-foreground">
          Your Event Planning Hub
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Upcoming Events:
          </h2>
          <Button variant="link" asChild>
            <Link href="#">View calendar</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const isExpanded = openEventId === event.id;

            return (
              <Card key={event.id} className="border border-border/70 bg-muted">
                <CardContent className="p-0">
                  <div className="hidden space-y-4 p-6 md:block">
                    <div className="grid gap-6 md:grid-cols-[2fr_1.2fr_auto] md:items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-semibold">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-base text-foreground">
                          {event.vendor}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground">
                          {event.timeRange}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {event.schedule}
                          </p>
                          <p className="text-muted-foreground">
                            {event.countdown}
                          </p>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {event.financialLabel}
                          </span>{" "}
                          {event.financialValue}
                        </p>
                        <p className="text-muted-foreground">
                          {event.location}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 text-sm md:items-end">
                        {event.actions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            {action}
                          </button>
                        ))}
                        <Button className="mt-1 w-full md:w-auto">
                          {event.ctaLabel}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => toggleEvent(event.id)}
                    >
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-foreground">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Next: {event.schedule}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {event.countdown}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                          {isExpanded ? "Hide" : "Show"}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded ? "rotate-180" : "rotate-0"
                            )}
                          />
                        </span>
                      </div>
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                        isExpanded
                          ? "max-h-150 opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="grid gap-6 px-6 pb-6 pt-0">
                        <div className="space-y-3 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {event.schedule}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.timeRange}
                            </p>
                          </div>
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {event.financialLabel}
                            </span>{" "}
                            {event.financialValue}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Vendor · {event.vendor}
                          </p>
                          <p className="text-muted-foreground">
                            {event.location}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 text-sm">
                          {event.actions.map((action) => (
                            <button
                              key={action}
                              type="button"
                              className="text-primary underline-offset-2 hover:underline"
                            >
                              {action}
                            </button>
                          ))}
                          <Button className="mt-1 w-full">
                            {event.ctaLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between px-0">
          <div>
            <CardTitle>Recommended for you</CardTitle>
            <CardDescription>
              Browse curated categories for your next booking.
            </CardDescription>
          </div>
          <Button variant="link" asChild>
            <Link href="#">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendedCategories.map((category) => (
              <div key={category.title} className="rounded-2xl">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {category.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
