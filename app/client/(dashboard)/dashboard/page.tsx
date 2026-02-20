"use client";

import { useMemo } from "react";
import { useBookings } from "@/hooks/api/use-booking";
import { getVendorPublicProfile } from "@/lib/actions/chat";
import { useQuery } from "@tanstack/react-query";

import { UpcomingEvents } from "./_components/upcoming-events";
import type { UpcomingEventProps } from "./_components/upcoming-events";
import { RecommendedVendors } from "./_components/recommended-categories";
import type { RecommendedVendor } from "./_components/recommended-categories";
import type { PopulatedVendor } from "@/types/booking";

/**
 * Extracts the vendor ID string from a BookingResponse.vendorId,
 * which can be either a plain string or a PopulatedVendor object.
 */
function getVendorId(vendorId: string | PopulatedVendor): string {
  return typeof vendorId === "string" ? vendorId : vendorId._id;
}

export default function ClientDashboardPage() {
  // ── Fetch all bookings ──
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
  } = useBookings(1, 50);

  const bookings = bookingsData?.data || [];

  // ── Upcoming bookings (next 2 future events) ──
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(
        (b) =>
          new Date(b.eventDetails.startDate) > now &&
          b.status !== "cancelled" &&
          b.status !== "completed",
      )
      .sort(
        (a, b) =>
          new Date(a.eventDetails.startDate).getTime() -
          new Date(b.eventDetails.startDate).getTime(),
      )
      .slice(0, 2);
  }, [bookings]);

  // ── Resolve vendor names for upcoming bookings ──
  const uniqueVendorIds = useMemo(
    () => [...new Set(upcomingBookings.map((b) => getVendorId(b.vendorId)))],
    [upcomingBookings],
  );

  const { data: vendorNames } = useQuery({
    queryKey: ["dashboard-vendor-names", uniqueVendorIds],
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        uniqueVendorIds.map(async (id) => {
          const result = await getVendorPublicProfile(id);
          if (result.success && result.data) {
            map[id] =
              result.data.businessProfile?.businessName || "Unknown Vendor";
          } else {
            map[id] = "Unknown Vendor";
          }
        }),
      );
      return map;
    },
    enabled: uniqueVendorIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const upcomingEvents: UpcomingEventProps[] = useMemo(
    () =>
      upcomingBookings.map((booking) => ({
        booking,
        vendorName:
          vendorNames?.[getVendorId(booking.vendorId)] || "Loading…",
      })),
    [upcomingBookings, vendorNames],
  );

  // ── Recommended vendors: same category as recently booked vendors ──
  const firstVendorId = bookings.length > 0 ? getVendorId(bookings[0].vendorId) : null;

  const { data: firstVendorServices } = useQuery({
    queryKey: ["dashboard-vendor-category", firstVendorId],
    queryFn: async () => {
      if (!firstVendorId) throw new Error("No vendor ID");
      const { getVendorServicesAction } = await import(
        "@/app/(home)/search/_data/actions"
      );
      return await getVendorServicesAction(firstVendorId);
    },
    enabled: !!firstVendorId,
    staleTime: 1000 * 60 * 10,
  });

  // VendorServicesResponse → data.data[0].serviceCategory._id
  const categoryId = firstVendorServices?.data?.data?.[0]?.serviceCategory?._id;

  // Fetch vendors ONLY after category is resolved (prevents flash of wrong results)
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
  } = useQuery({
    queryKey: ["dashboard-recommended-vendors", categoryId],
    queryFn: async () => {
      const { getVendorsAction } = await import(
        "@/app/(home)/search/_data/actions"
      );
      return await getVendorsAction({ service: categoryId!, limit: 8 });
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });

  const recommendedVendors: RecommendedVendor[] = useMemo(() => {
    if (!vendorsData?.data?.data) return [];
    // Exclude vendors who the user already booked
    const bookedVendorIds = new Set(bookings.map((b) => getVendorId(b.vendorId)));
    return vendorsData.data.data
      .filter((v) => !bookedVendorIds.has(v._id))
      .slice(0, 4)
      .map((v) => ({
        _id: v._id,
        name: v.name,
        slug: v.slug,
        coverImage: v.coverImage || "",
        categoryName: v.serviceCategory?.name || "",
        rate: v.rate || 0,
        address: v.address || "",
      }));
  }, [vendorsData, bookings]);

  // Show loading while we're resolving the category or fetching vendors
  const recommendedLoading =
    bookingsLoading || (bookings.length > 0 && (!categoryId || vendorsLoading));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-base text-muted-foreground">
          Your Event Planning Hub
        </p>
      </div>

      <UpcomingEvents events={upcomingEvents} isLoading={bookingsLoading} />

      <RecommendedVendors
        vendors={recommendedVendors}
        isLoading={recommendedLoading}
        hasBookings={bookings.length > 0}
      />
    </section>
  );
}
