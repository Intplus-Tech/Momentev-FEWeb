"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { BookingResponse, BookingStatus, PopulatedCustomer } from "@/types/booking";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  paid: "default",
  completed: "secondary",
  pending: "outline",
  pending_payment: "outline",
  cancelled: "destructive",
  rejected: "destructive",
};

const STATUS_TONE: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500",
  paid: "bg-emerald-500",
  completed: "bg-sky-500",
  pending: "bg-amber-500",
  pending_payment: "bg-amber-500",
  cancelled: "bg-rose-500",
  rejected: "bg-rose-500",
};

const LEGEND_ITEMS = [
  {
    label: "Confirmed / paid",
    tone: "bg-emerald-500",
  },
  {
    label: "Pending",
    tone: "bg-amber-500",
  },
  {
    label: "Completed",
    tone: "bg-sky-500",
  },
  {
    label: "Cancelled / rejected",
    tone: "bg-rose-500",
  },
] as const;

interface BookingCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: BookingResponse[];
  getBookingHref?: (booking: BookingResponse) => string;
}

function getCustomerName(customerId: BookingResponse["customerId"]) {
  if (typeof customerId === "object" && customerId !== null) {
    const customer = customerId as PopulatedCustomer;
    return `${customer.firstName} ${customer.lastName}`.trim();
  }

  return "Client";
}

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function BookingCalendarModal({
  open,
  onOpenChange,
  bookings,
  getBookingHref,
}: BookingCalendarModalProps) {
  const today = new Date();
  const [activeYear, setActiveYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [mobileView, setMobileView] = useState<"calendar" | "day">("calendar");
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialDate = new Date();
    setActiveYear(initialDate.getFullYear());
    setSelectedDate(initialDate);
    setMobileView("calendar");
  }, [open]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setMobileView("calendar");
      }
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, BookingResponse[]>();

    bookings.forEach((booking) => {
      const date = new Date(booking.eventDetails.startDate);
      const key = getDateKey(date);
      const current = grouped.get(key) ?? [];
      current.push(booking);
      grouped.set(key, current);
    });

    return grouped;
  }, [bookings]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(activeYear, index, 1)),
    [activeYear]
  );

  const selectedDateKey = getDateKey(selectedDate);
  const selectedBookings = bookingsByDate.get(selectedDateKey) ?? [];
  const showMobileDayView = isMobileViewport && mobileView === "day";

  const handleSelectDate = (day: Date) => {
    setSelectedDate(day);
    if (isMobileViewport) {
      setMobileView("day");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[92vh] w-[min(96vw,88rem)] max-w-[96vw] overflow-hidden p-0 sm:max-w-[96vw] lg:max-w-352"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="gap-2 hidden xl:flex">
                <DialogTitle className="text-2xl">Booking Calendar</DialogTitle>
                <DialogDescription>
                  Browse the year, spot booked days, and jump into booking details.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-1 flex-col items-center gap-3 xl:items-end">
                <div className="hidden flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border bg-background px-3 py-2 text-[11px] text-muted-foreground sm:flex xl:justify-end">
                  {LEGEND_ITEMS.map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <span className={cn("h-1 w-1 shrink-0 rounded-full", item.tone)} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 rounded-full border bg-muted/40">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setActiveYear((year) => year - 1)}
                    aria-label="Previous year"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-20 px-2 text-center text-sm font-semibold text-foreground">
                    {activeYear}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setActiveYear((year) => year + 1)}
                    aria-label="Next year"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <DialogClose asChild>
                  <Button size="icon-sm" className="shrink-0 self-end rounded-full">
                    <span className="sr-only">Close</span>
                    ×
                  </Button>
                </DialogClose>
              </div>


            </div>
          </div>


          <div className="min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
            {isMobileViewport ? (
              // Mobile: show calendar OR day view, but not both
              showMobileDayView ? (
                // Mobile day details view - fullscreen
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setMobileView("calendar")}
                    >
                      <ChevronLeft className="size-4" />
                      Back
                    </Button>
                    <Badge variant="outline">Year {activeYear}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBookings.length > 0
                        ? `${selectedBookings.length} booking${selectedBookings.length === 1 ? "" : "s"} scheduled`
                        : "No bookings scheduled for this day"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{bookings.length} total bookings</Badge>
                    <Badge variant="outline">
                      {selectedBookings.filter((booking) => ["confirmed", "paid", "completed"].includes(booking.status)).length} confirmed
                    </Badge>
                  </div>

                  <ScrollArea className="h-[65vh] pr-3">
                    <div className="space-y-3">
                      {selectedBookings.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                          No bookings for this day.
                        </div>
                      ) : (
                        selectedBookings.map((booking) => {
                          const customerName = getCustomerName(booking.customerId);
                          const bookingHref = getBookingHref?.(booking) ?? `/vendor/bookings/${booking._id}`;

                          return (
                            <Link
                              key={booking._id}
                              href={bookingHref}
                              className="block rounded-xl border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-muted/40"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {booking.eventDetails.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{customerName}</p>
                                </div>
                                <Badge variant={STATUS_VARIANT[booking.status]} className="capitalize">
                                  {booking.status.replace("_", " ")}
                                </Badge>
                              </div>

                              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <Clock3 className="size-3.5" />
                                  {format(new Date(booking.eventDetails.startDate), "h:mm a")} - {format(new Date(booking.eventDetails.endDate), "h:mm a")}
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="size-3.5" />
                                  {booking.location.addressText}
                                </p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                // Mobile calendar view - fullscreen
                <ScrollArea className="h-[65vh] pr-3">
                  <div className="grid gap-4 grid-cols-1">
                    {months.map((month) => {
                      const monthStart = startOfMonth(month);
                      const monthEnd = endOfMonth(month);
                      const monthDays = eachDayOfInterval({
                        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
                        end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
                      });

                      const monthBookingCount = bookings.filter((booking) => {
                        const bookingDate = new Date(booking.eventDetails.startDate);
                        return bookingDate.getFullYear() === activeYear && bookingDate.getMonth() === month.getMonth();
                      }).length;

                      return (
                        <section
                          key={month.toISOString()}
                          className="rounded-2xl border bg-background p-4 shadow-sm"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-foreground">
                                {format(month, "MMMM")}
                              </h3>
                              <p className="text-xs text-muted-foreground">{activeYear}</p>
                            </div>
                            <Badge variant="outline" className="gap-1.5">
                              <CalendarDays className="size-3.5" />
                              {monthBookingCount}
                            </Badge>
                          </div>

                          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                              <span key={day}>{day}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {monthDays.map((day) => {
                              const dayKey = getDateKey(day);
                              const dayBookings = bookingsByDate.get(dayKey) ?? [];
                              const isCurrentMonth = isSameMonth(day, monthStart);
                              const isSelected = dayKey === selectedDateKey;

                              return (
                                <button
                                  type="button"
                                  key={dayKey}
                                  onClick={() => handleSelectDate(day)}
                                  className={cn(
                                    "group flex aspect-square flex-col rounded-xl border px-2 py-1 text-left text-xs transition-all hover:border-primary/40 hover:bg-muted/60",
                                    isCurrentMonth
                                      ? "border-border bg-background"
                                      : "border-dashed border-border/60 bg-muted/20 text-muted-foreground",
                                    isSelected && "border-primary bg-primary/8 ring-2 ring-primary/25",
                                    isToday(day) && "shadow-[0_0_0_1px_hsl(var(--primary))]"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span
                                      className={cn(
                                        "text-[11px] font-medium",
                                        isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                                      )}
                                    >
                                      {format(day, "d")}
                                    </span>
                                    {dayBookings.length > 0 ? (
                                      <span
                                        className={cn(
                                          "mt-0.5 h-1 w-1 shrink-0 rounded-full",
                                          STATUS_TONE[dayBookings[0].status]
                                        )}
                                      />
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </ScrollArea>
              )
            ) : (
              // Desktop: show calendar and day panel side by side
              <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)]">
                <ScrollArea className="h-[58vh] pr-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {months.map((month) => {
                      const monthStart = startOfMonth(month);
                      const monthEnd = endOfMonth(month);
                      const monthDays = eachDayOfInterval({
                        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
                        end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
                      });

                      const monthBookingCount = bookings.filter((booking) => {
                        const bookingDate = new Date(booking.eventDetails.startDate);
                        return bookingDate.getFullYear() === activeYear && bookingDate.getMonth() === month.getMonth();
                      }).length;

                      return (
                        <section
                          key={month.toISOString()}
                          className="rounded-2xl border bg-background p-4 shadow-sm"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-foreground">
                                {format(month, "MMMM")}
                              </h3>
                              <p className="text-xs text-muted-foreground">{activeYear}</p>
                            </div>
                            <Badge variant="outline" className="gap-1.5">
                              <CalendarDays className="size-3.5" />
                              {monthBookingCount}
                            </Badge>
                          </div>

                          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                              <span key={day}>{day}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {monthDays.map((day) => {
                              const dayKey = getDateKey(day);
                              const dayBookings = bookingsByDate.get(dayKey) ?? [];
                              const isCurrentMonth = isSameMonth(day, monthStart);
                              const isSelected = dayKey === selectedDateKey;

                              return (
                                <button
                                  type="button"
                                  key={dayKey}
                                  onClick={() => handleSelectDate(day)}
                                  className={cn(
                                    "group flex aspect-square flex-col rounded-xl border px-2 py-1 text-left text-xs transition-all hover:border-primary/40 hover:bg-muted/60",
                                    isCurrentMonth
                                      ? "border-border bg-background"
                                      : "border-dashed border-border/60 bg-muted/20 text-muted-foreground",
                                    isSelected && "border-primary bg-primary/8 ring-2 ring-primary/25",
                                    isToday(day) && "shadow-[0_0_0_1px_hsl(var(--primary))]"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span
                                      className={cn(
                                        "text-[11px] font-medium",
                                        isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                                      )}
                                    >
                                      {format(day, "d")}
                                    </span>
                                    {dayBookings.length > 0 ? (
                                      <span
                                        className={cn(
                                          "mt-0.5 h-1 w-1 shrink-0 rounded-full",
                                          STATUS_TONE[dayBookings[0].status]
                                        )}
                                      />
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBookings.length > 0
                        ? `${selectedBookings.length} booking${selectedBookings.length === 1 ? "" : "s"} scheduled`
                        : "No bookings scheduled for this day"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Year {activeYear}</Badge>
                    <Badge variant="outline">{bookings.length} total bookings</Badge>
                    <Badge variant="outline">
                      {selectedBookings.filter((booking) => ["confirmed", "paid", "completed"].includes(booking.status)).length} confirmed
                    </Badge>
                  </div>

                  <ScrollArea className="h-[42vh] pr-3">
                    <div className="space-y-3">
                      {selectedBookings.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                          Pick a marked day to see bookings here.
                        </div>
                      ) : (
                        selectedBookings.map((booking) => {
                          const customerName = getCustomerName(booking.customerId);
                          const bookingHref = getBookingHref?.(booking) ?? `/vendor/bookings/${booking._id}`;

                          return (
                            <Link
                              key={booking._id}
                              href={bookingHref}
                              className="block rounded-xl border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-muted/40"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {booking.eventDetails.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{customerName}</p>
                                </div>
                                <Badge variant={STATUS_VARIANT[booking.status]} className="capitalize">
                                  {booking.status.replace("_", " ")}
                                </Badge>
                              </div>

                              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <Clock3 className="size-3.5" />
                                  {format(new Date(booking.eventDetails.startDate), "h:mm a")} - {format(new Date(booking.eventDetails.endDate), "h:mm a")}
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="size-3.5" />
                                  {booking.location.addressText}
                                </p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}