"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UpcomingEvent = {
  id: string;
  title: string;
  vendor: string;
  schedule: string;
  countdown: string;
  financialLabel: string;
  financialValue: string;
  timeRange: string;
  location: string;
  actions: string[];
  ctaLabel: string;
};

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [openEventId, setOpenEventId] = useState<string | null>(
    events[0]?.id ?? null
  );

  const toggleEvent = (id: string) => {
    setOpenEventId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming Events:
        </h2>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const isExpanded = openEventId === event.id;

          return (
            <Card
              key={event.id}
              className="border border-border/50 bg-muted p-2"
            >
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
                      <p className="text-muted-foreground">{event.location}</p>
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
                        ? "max-h-[600px] opacity-100"
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
  );
}
