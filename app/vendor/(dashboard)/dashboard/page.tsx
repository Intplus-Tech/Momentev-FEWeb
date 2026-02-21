import type { BookingResponse, PopulatedCustomer, PopulatedVendor } from "@/types/booking";

import {
  CalendarDays,
  Coins,
  Star,
  UsersRound,
} from "lucide-react";

import { fetchVendorBookings } from "@/lib/actions/booking";
import { fetchVendorReviews } from "@/lib/actions/reviews";
import { getUserProfile } from "@/lib/actions/user";

import { BookingsPanel } from "./_components/bookings-panel";
import { HeroSection } from "./_components/hero-section";
import { ReviewsPanel } from "./_components/reviews-panel";
import { ScheduleCard } from "./_components/schedule-card";
import { StatsGrid } from "./_components/stats-grid";
import type { DashboardStat } from "./data";

const DashboardPage = async () => {
  // Parallel-fetch all data
  const [profileResult, bookingsResult] = await Promise.all([
    getUserProfile(),
    fetchVendorBookings(1, 50), // Fetch up to 50 bookings for stat computation
  ]);

  const profile = profileResult.data;
  const vendorId = profile?.vendor?._id as string | undefined;

  // Only fetch reviews once we have the vendorId
  const reviewsResult = vendorId
    ? await fetchVendorReviews(vendorId, 1, 6)
    : { success: false, data: undefined };

  const bookings: BookingResponse[] = bookingsResult.data?.data ?? [];
  const totalBookings: number = bookingsResult.data?.total ?? 0;
  const reviews = reviewsResult.success ? (reviewsResult.data?.data ?? []) : [];

  // ── Stat computations ─────────────────────────────────────────────────────

  // Unique client count from returned booking page
  const uniqueClientIds = new Set(
    bookings.map((b) => {
      if (typeof b.customerId === "object") {
        return (b.customerId as PopulatedCustomer)._id;
      }
      return b.customerId as string;
    })
  );

  // Total revenue from paid/confirmed/completed bookings
  const revenue = bookings
    .filter((b) => ["paid", "confirmed", "completed"].includes(b.status))
    .reduce((sum, b) => sum + (b.amounts?.total ?? 0), 0);

  // Pending bookings count
  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "pending_payment"
  ).length;

  // Rating from vendor profile (populated via getUserProfile)
  const vendorData = profile?.vendor as PopulatedVendor | undefined;
  const avgRating = vendorData?.rate ?? 0;
  const reviewCount = vendorData?.reviewCount ?? 0;

  const stats: DashboardStat[] = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: `${pendingCount} pending`,
      icon: CalendarDays,
      accent: "bg-primary/15 text-primary",
    },
    {
      title: "Active Clients",
      value: uniqueClientIds.size.toString(),
      change: `From ${totalBookings} bookings`,
      icon: UsersRound,
      accent: "bg-primary/10 text-primary",
    },
    {
      title: "Total Revenue",
      value: `£${revenue.toLocaleString()}`,
      change: "Paid & confirmed",
      icon: Coins,
      accent: "bg-primary/10 text-primary",
    },
    {
      title: "Avg. Rating",
      value: avgRating > 0 ? avgRating.toFixed(1) : "—",
      change: reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet",
      icon: Star,
      accent: "bg-primary/15 text-primary",
    },
  ];

  // ── Hero content ──────────────────────────────────────────────────────────
  const firstName = profile?.firstName ?? "there";
  const businessCity =
    (profile?.vendor?.businessProfile as any)?.city ?? "your area";

  // Upcoming bookings: future dates, max 4 shown
  const now = new Date();
  const upcomingBookings = bookings
    .filter((b) => new Date(b.eventDetails.startDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.eventDetails.startDate).getTime() -
        new Date(b.eventDetails.startDate).getTime()
    )
    .slice(0, 4);

  return (
    <section className="space-y-6">
      <HeroSection
        name={firstName}
        location={businessCity}
        helperText="Reach more clients on Momentev"
        ctaLabel="Add New Service"
      />
      <StatsGrid stats={stats} />
      <div className="grid gap-4 lg:grid-cols-3">
        <BookingsPanel bookings={upcomingBookings} />
        <ScheduleCard bookings={bookings} />
      </div>
      <ReviewsPanel reviews={reviews} />
    </section>
  );
};

export default DashboardPage;
