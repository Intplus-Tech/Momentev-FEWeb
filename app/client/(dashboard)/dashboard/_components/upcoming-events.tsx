"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Clock, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BookingResponse } from "@/types/booking";

export interface UpcomingEventProps {
  booking: BookingResponse;
  vendorName: string;
}

interface UpcomingEventsProps {
  events: UpcomingEventProps[];
  isLoading?: boolean;
}

export function UpcomingEvents({ events, isLoading }: UpcomingEventsProps) {
  const [openEventId, setOpenEventId] = useState<string | null>(
    events[0]?.booking._id ?? null,
  );

  const toggleEvent = (id: string) => {
    setOpenEventId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming Events:
        </h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-border/50 bg-muted p-2">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 w-48 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-32 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-64 rounded bg-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming Events:
        </h2>
        <Card className="border border-border/50 bg-muted p-2">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No upcoming events</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/search">Browse vendors to book your next event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming Events:
        </h2>
      </div>

      <div className="space-y-4">
        {events.map(({ booking, vendorName }) => {
          const isExpanded = openEventId === booking._id;
          const startDate = new Date(booking.eventDetails.startDate);
          const endDate = new Date(booking.eventDetails.endDate);
          const countdown = formatDistanceToNow(startDate, {
            addSuffix: false,
          });
          const formattedDate = format(startDate, "EEE, d MMM yyyy 'at' h:mm a");
          const timeRange = `${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;
          const currencySymbol = booking.currency === "GBP" ? "£" : booking.currency === "USD" ? "$" : booking.currency;
          const totalAmount = `${currencySymbol}${booking.amounts.total.toLocaleString()}`;
          const location = booking.location?.addressText || "TBD";

          return (
            <Card
              key={booking._id}
              className="border border-border/50 bg-muted p-2"
            >
              <CardContent className="p-0">
                {/* Desktop layout */}
                <div className="hidden space-y-4 p-6 md:block">
                  <div className="grid gap-6 md:grid-cols-[2fr_1.2fr_auto] md:items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold">
                        {booking.eventDetails.title}
                      </CardTitle>
                      <CardDescription className="text-base text-foreground">
                        {vendorName}
                      </CardDescription>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {timeRange}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="font-medium text-foreground">
                          {formattedDate}
                        </p>
                        <p className="text-muted-foreground">
                          ({countdown})
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Total:
                        </span>{" "}
                        {totalAmount}
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {location}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm md:items-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/client/bookings">View Booking</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => toggleEvent(booking._id)}
                  >
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground">
                        {booking.eventDetails.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Next: {formattedDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {countdown}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        {isExpanded ? "Hide" : "Show"}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded ? "rotate-180" : "rotate-0",
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
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="grid gap-6 px-6 pb-6 pt-0">
                      <div className="space-y-3 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {formattedDate}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timeRange}
                          </p>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Total:
                          </span>{" "}
                          {totalAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vendor · {vendorName}
                        </p>
                        <p className="text-muted-foreground">{location}</p>
                      </div>

                      <div className="flex flex-col gap-2 text-sm">
                        <Button className="mt-1 w-full" asChild>
                          <Link href="/client/bookings">View Booking</Link>
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
