"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Clock, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingResponse, BookingStatus } from "@/types/booking";
import formatMoney from "@/lib/formatMoney";

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: {
    label: "Pending Vendor Confirmation",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  paid: {
    label: "Paid",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  booked: {
    label: "Booked",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  completed: {
    label: "Completed",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

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
          const formattedDate = format(startDate, "EEE, d MMM yyyy");
          const timeRange = `${format(startDate, "h:mm a")} – ${format(endDate, "h:mm a")}`;
          const totalAmount = formatMoney(booking.amounts?.total ?? 0, booking.currency || "GBP");
          const location = booking.location?.addressText || "TBD";
          const sc = statusConfig[booking.status] ?? statusConfig.pending;

          return (
            <Card
              key={booking._id}
              className="border border-border/60 bg-card overflow-hidden transition-all hover:shadow-sm p-0"
            >
              <CardContent className="p-0">
                {/* Desktop layout */}
                <div className="hidden p-6 sm:block">
                  <div className="flex flex-row items-start justify-between gap-6">
                    {/* Left: Title, Vendor, Details */}
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                          {booking.eventDetails.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          Vendor · <span className="text-foreground/80">{vendorName}</span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2.5">
                          <CalendarDays className="h-4 w-4 shrink-0 text-primary/70" />
                          <span className="font-medium text-foreground">{formattedDate}</span>
                          <span className="text-xs">({countdown})</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 shrink-0 text-primary/70" />
                          <span>{timeRange}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Badge, Total, Button */}
                    <div className="flex flex-col items-end justify-between self-stretch min-w-[140px]">
                      <Badge
                        variant="outline"
                        className={cn("px-2.5 py-0.5 text-xs font-medium", sc.color)}
                      >
                        {sc.label}
                      </Badge>

                      <div className="flex flex-col items-end gap-3 mt-auto pt-4">
                        <div className="text-right">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total</p>
                          <p className="text-lg font-bold text-foreground">{totalAmount}</p>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/client/bookings/${booking._id}`}>View Booking</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 p-5 text-left focus:outline-none hover:bg-muted/30 transition-colors"
                    onClick={() => toggleEvent(booking._id)}
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-2">
                        {booking.eventDetails.title}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        Vendor · <span className="text-foreground/80">{vendorName}</span>
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("mt-1 w-fit text-[10px] px-2 py-0.5 font-medium", sc.color)}
                      >
                        {sc.label}
                      </Badge>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {countdown}
                      </p>
                      <span className="mt-1 inline-flex items-center justify-end gap-1 text-xs font-medium text-primary w-full">
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
                    <div className="flex flex-col gap-4 px-5 pb-5 pt-0">
                      <div className="space-y-3 rounded-lg bg-muted/50 p-3.5 text-sm text-muted-foreground border border-border/40">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">{formattedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 shrink-0 text-primary/70" />
                          <p>{timeRange}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                          <p className="line-clamp-2 leading-relaxed">{location}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-4 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total</p>
                          <p className="text-base font-bold text-foreground">{totalAmount}</p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/client/bookings/${booking._id}`}>View Booking</Link>
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
