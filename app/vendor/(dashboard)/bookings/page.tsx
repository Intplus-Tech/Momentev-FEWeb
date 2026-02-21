import { CalendarDays, ClipboardList, Coins, GaugeCircle } from "lucide-react";
import { AlertCircle } from "lucide-react";

import { fetchVendorBookings } from "@/lib/actions/booking";
import { BookingStats } from "./_components/booking-stats";
import { ConfirmedBookingsTable } from "./_components/confirmed-bookings-table";
import { TodaysSchedule } from "./_components/todays-schedule";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingStat } from "./data";

export default async function VendorBookingsPage() {
  const response = await fetchVendorBookings(1, 50);

  if (!response.success || !response.data) {
    return (
      <section className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage all your appointments in one place
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {response.error ?? "Failed to load bookings. Please try again later."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const bookings = response.data.data;
  const total = response.data.total;

  // Derive stats from real data
  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "pending_payment"
  ).length;

  const upcomingRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "paid" || b.status === "pending_payment")
    .reduce((sum, b) => {
      const amt =
        b.amounts.total > 0
          ? b.amounts.total
          : b.budgetAllocations.reduce((s, a) => s + a.budgetedAmount, 0);
      return sum + amt;
    }, 0);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "paid").length;
  const responseRate =
    total > 0
      ? Math.round((confirmedCount / total) * 100)
      : 0;

  const revenueFormatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(upcomingRevenue);

  const bookingStats: BookingStat[] = [
    {
      label: "Total Bookings",
      value: String(total),
      helper: `${confirmedCount} confirmed`,
      subtext: "All time",
      icon: CalendarDays,
    },
    {
      label: "Pending Requests",
      value: String(pendingCount),
      helper: "Awaiting action",
      subtext: "Requires your attention",
      icon: ClipboardList,
    },
    {
      label: "Upcoming Revenue",
      value: revenueFormatted,
      helper: "Confirmed + pending payment",
      subtext: "Based on current bookings",
      icon: Coins,
    },
    {
      label: "Confirmation Rate",
      value: `${responseRate}%`,
      helper: `${confirmedCount} of ${total} confirmed`,
      subtext: "All bookings",
      icon: GaugeCircle,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Manage all your appointments in one place
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
      </div>

      <BookingStats stats={bookingStats} />

      <TodaysSchedule bookings={bookings} />

      <ConfirmedBookingsTable bookings={bookings} />
    </section>
  );
}
