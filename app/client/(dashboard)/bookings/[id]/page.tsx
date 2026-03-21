import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Users, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { fetchBookingById } from "@/lib/actions/booking";
import { getVendorPublicProfile } from "@/lib/actions/chat";
import { fetchServiceSpecialtyById } from "@/lib/actions/service-specialties";
import type { PopulatedVendor, PopulatedVendorSpecialty } from "@/types/booking";

import { BookingDetailActions } from "./_components/BookingDetailActions";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  pending_payment: { label: "Pending Payment", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  paid: { label: "Paid", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetchBookingById(id);

  if (!response.success || !response.data) {
    if (response.error === "Booking not found") notFound();

    return (
      <section className="space-y-6">
        <Link
          href="/client/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            {response.error || "Failed to load booking. Please try again later."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const booking = response.data;
  const status = statusConfig[booking.status] ?? statusConfig.pending;

  // Vendor details
  const vendor = booking.vendorId as PopulatedVendor;
  const vendorId = typeof vendor === "string" ? vendor : vendor._id;
  const vendorResult = await getVendorPublicProfile(vendorId);
  const vendorBusinessName =
    vendorResult.data?.businessProfile?.businessName ?? "Unknown Vendor";
  const vendorRating = vendorResult.data?.rate ?? 0;

  // Service specialty names
  const serviceNamesMap: Record<string, string> = {};
  const specialtyIds = [
    ...new Set(
      (booking.budgetAllocations ?? [])
        .map((a) => (a.vendorSpecialtyId as PopulatedVendorSpecialty)?.serviceSpecialty)
        .filter(Boolean)
    ),
  ];
  await Promise.all(
    specialtyIds.map(async (specialtyId) => {
      if (typeof specialtyId === "string") {
        const r = await fetchServiceSpecialtyById(specialtyId);
        if (r.success && r.data) serviceNamesMap[specialtyId] = r.data.data.name;
      }
    })
  );

  const allocations = booking.budgetAllocations ?? [];
  const totalBudget = allocations.reduce((sum, a) => sum + a.budgetedAmount, 0);
  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: booking.currency || "GBP",
  }).format(booking.amounts?.total || totalBudget);

  const formattedStartDate = format(new Date(booking.eventDetails.startDate), "MMM dd, yyyy");
  const formattedEndDate = format(new Date(booking.eventDetails.endDate), "MMM dd, yyyy");
  const startTime = format(new Date(booking.eventDetails.startDate), "h:mm a");
  const endTime = format(new Date(booking.eventDetails.endDate), "h:mm a");

  return (
    <section className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href="/client/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {booking.eventDetails.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Booking ID: #{booking._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <Badge variant="outline" className={cn("font-medium text-sm", status.color)}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <BookingDetailActions
        booking={booking}
        vendorId={vendorId}
        formattedTotal={formattedTotal}
      />

      <Separator />

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Event Details */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">Event Details</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Date & Time</p>
                  <p>
                    {formattedStartDate}
                    {formattedStartDate !== formattedEndDate && ` to ${formattedEndDate}`}
                  </p>
                  <p>
                    {startTime} – {endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-foreground" />
                <p>
                  <span className="font-medium text-foreground">Guests: </span>
                  {booking.eventDetails.guestCount}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p>{booking.location.addressText}</p>
                </div>
              </div>
            </div>
          </section>

          {booking.eventDetails.description && (
            <section className="space-y-2">
              <h2 className="font-semibold text-foreground">Description</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {booking.eventDetails.description}
              </p>
            </section>
          )}
        </div>

        {/* Right: Vendor, Services & Payment */}
        <div className="space-y-6 bg-muted/50 p-4 rounded-xl border">
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground border-b pb-2">Vendor</h2>
            <p className="font-medium text-foreground">{vendorBusinessName}</p>
            {vendorRating > 0 && (
              <p className="text-sm text-muted-foreground">
                Rating: {vendorRating.toFixed(1)} ⭐
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground border-b pb-2">Services & Budget</h2>
            <div className="space-y-3 text-sm">
              {allocations.map((allocation, idx) => {
                const specialty = allocation.vendorSpecialtyId as PopulatedVendorSpecialty;
                const rawId = specialty?.serviceSpecialty;
                const name = (rawId && serviceNamesMap[rawId]) || rawId || `Service ${idx + 1}`;
                const budgetFormatted = new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: booking.currency || "GBP",
                }).format(allocation.budgetedAmount);

                return (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rate:{" "}
                        {specialty?.priceCharge
                          ? specialty.priceCharge.replace(/_/g, " ")
                          : "TBD"}
                      </p>
                    </div>
                    <p className="font-medium shrink-0">{budgetFormatted}</p>
                  </div>
                );
              })}

              <div className="pt-3 border-t flex justify-between items-center font-bold text-base text-foreground">
                <p>Total</p>
                <p>{formattedTotal}</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground border-b pb-2">Payment</h2>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                <p>
                  <span className="font-medium text-foreground">Model: </span>
                  <span className="capitalize">{booking.paymentModel.replace(/_/g, " ")}</span>
                </p>
              </div>
              {booking.payment?.status && (
                <p className="pl-6">
                  <span className="font-medium text-foreground">Status: </span>
                  <span className="capitalize">{booking.payment.status.replace(/_/g, " ")}</span>
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
