import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, CreditCard, MapPin, User, Users } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchBookingById } from "@/lib/actions/booking";
import { cn } from "@/lib/utils";
import formatMoney from "@/lib/formatMoney";
import type { BookingStatus, PopulatedCustomer, PopulatedVendorSpecialty } from "@/types/booking";
import { fetchServiceSpecialtyById } from "@/lib/actions/service-specialties";
import { UnifiedBookingActions } from "./_components/UnifiedBookingActions";

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
    color: "bg-green-500/10 text-green-600 border-green-500/20",
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

export const dynamic = "force-dynamic";

export default async function VendorBookingDetailPage({
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
          href="/vendor/bookings"
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

  const customer = booking.customerId as string | PopulatedCustomer;
  const customerName =
    typeof customer === "string"
      ? customer
      : `${customer.firstName} ${customer.lastName}`.trim() || "Customer";
  const customerEmail = typeof customer === "string" ? null : customer.email;

  const serviceNamesMap: Record<string, string> = {};
  const specialtyIds = [
    ...new Set(
      (booking.budgetAllocations ?? [])
        .map((allocation) => (allocation.vendorSpecialtyId as PopulatedVendorSpecialty)?.serviceSpecialty)
        .filter((specialtyId): specialtyId is string => Boolean(specialtyId))
    ),
  ];

  await Promise.all(
    specialtyIds.map(async (specialtyId) => {
      const result = await fetchServiceSpecialtyById(specialtyId);
      if (result.success && result.data) {
        serviceNamesMap[specialtyId] = result.data.data.name;
      }
    })
  );

  const allocations = booking.budgetAllocations ?? [];
  const fallbackTotal = allocations.reduce((sum, allocation) => sum + allocation.budgetedAmount, 0);
  const finalTotal = booking.amounts?.total || fallbackTotal;

  const formattedTotal = formatMoney(finalTotal, booking.currency || "GBP");
  const subtotalFormatted = formatMoney(booking.amounts?.subtotal ?? fallbackTotal, booking.currency || "GBP");
  const feesFormatted = formatMoney(booking.amounts?.fees ?? 0, booking.currency || "GBP");
  const commissionFormatted = formatMoney(booking.amounts?.commission ?? 0, booking.currency || "GBP");
  const serviceCategory = typeof booking.serviceCategoryId === "object" ? booking.serviceCategoryId.name : null;
  const pricingTypeLabel =
    booking.pricingType === "hourly_rate"
      ? "Hourly rate"
      : booking.pricingType === "package_pricing"
        ? "Package pricing"
        : booking.pricingType === "custom_quotes"
          ? "Custom quote"
          : "Not specified";
  const hourlyRateFormatted = booking.hourlyDetails
    ? formatMoney(booking.hourlyDetails.hourlyRate, booking.currency || "GBP")
    : null;
  const estimatedHours = booking.hourlyDetails?.estimatedServiceHours;
  const estimatedHourlyTotal =
    booking.hourlyDetails && estimatedHours
      ? formatMoney(booking.hourlyDetails.hourlyRate * estimatedHours, booking.currency || "GBP")
      : null;

  const formattedStartDate = format(new Date(booking.eventDetails.startDate), "MMM dd, yyyy");
  const formattedEndDate = format(new Date(booking.eventDetails.endDate), "MMM dd, yyyy");
  const startTime = format(new Date(booking.eventDetails.startDate), "h:mm a");
  const endTime = format(new Date(booking.eventDetails.endDate), "h:mm a");

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/vendor/bookings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {booking.eventDetails.title}
            </h1>
          </div>
          <Badge variant="outline" className={cn("text-sm font-medium", status.color)}>
            {status.label}
          </Badge>
        </div>
      </div>

      <Separator />

      <UnifiedBookingActions booking={booking} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="space-y-6 self-start">
          <section className="space-y-3">
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <h2 className="font-semibold text-foreground">Pricing Snapshot</h2>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-foreground">Pricing model</p>
                <p className="text-muted-foreground text-right">{pricingTypeLabel}</p>
              </div>
              {serviceCategory ? (
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-foreground">Category</p>
                  <p className="text-muted-foreground text-right">{serviceCategory}</p>
                </div>
              ) : null}
              {booking.hourlyDetails ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">Hourly rate</p>
                    <p className="text-muted-foreground text-right">{hourlyRateFormatted}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">Estimated hours</p>
                    <p className="text-muted-foreground text-right">{estimatedHours}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">Estimated hourly total</p>
                    <p className="text-muted-foreground text-right">{estimatedHourlyTotal}</p>
                  </div>
                </>
              ) : null}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium text-foreground">{subtotalFormatted}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground">Fees</p>
                  <p className="font-medium text-foreground">{feesFormatted}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground">Commission</p>
                  <p className="font-medium text-foreground">{commissionFormatted}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">Event Details</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Date & Time</p>
                  <p>
                    {formattedStartDate}
                    {formattedStartDate !== formattedEndDate ? ` to ${formattedEndDate}` : ""}
                  </p>
                  <p>
                    {startTime} - {endTime}
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
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p>{booking.location.addressText}</p>
                </div>
              </div>
            </div>
          </section>

          {booking.eventDetails.description ? (
            <section className="space-y-2">
              <h2 className="font-semibold text-foreground">Description</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {booking.eventDetails.description}
              </p>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">Client</h2>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <User className="h-4 w-4" />
                {customerName}
              </p>
              {customerEmail ? (
                <p className="mt-1 text-muted-foreground">{customerEmail}</p>
              ) : null}
              {typeof customer !== "string" && customer.phoneNumber ? (
                <p className="mt-1 text-muted-foreground">{customer.phoneNumber}</p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-6 rounded-xl border bg-muted/50 p-4 self-start h-fit">
          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">Services & Budget</h2>
            <div className="space-y-3 text-sm">
              {allocations.map((allocation, index) => {
                const specialty = allocation.vendorSpecialtyId as PopulatedVendorSpecialty;
                const rawId = specialty?.serviceSpecialty;
                const serviceName = rawId ? serviceNamesMap[rawId] || rawId : `Service ${index + 1}`;

                const budgetFormatted = formatMoney(allocation.budgetedAmount, booking.currency || "GBP");

                return (
                  <div key={`${booking._id}-${index}`} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        Rate: {specialty?.priceCharge ? specialty.priceCharge.replace(/_/g, " ") : "TBD"}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium">{budgetFormatted}</p>
                  </div>
                );
              })}

              <div className="flex items-center justify-between border-t pt-3 text-base font-bold text-foreground">
                <p>Total</p>
                <p>{formattedTotal}</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="border-b pb-2 font-semibold text-foreground">Payment</h2>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                <p>
                  <span className="font-medium text-foreground">Model: </span>
                  <span className="capitalize">{booking.paymentModel.replace(/_/g, " ")}</span>
                </p>
              </div>
              {typeof booking.vendorId !== "string" ? (
                <p className="pl-6">
                  <span className="font-medium text-foreground">Vendor payout: </span>
                  <span className="capitalize">{booking.vendorId.paymentModel.replace(/_/g, " ")}</span>
                </p>
              ) : null}
              {booking.payment?.status ? (
                <p className="pl-6">
                  <span className="font-medium text-foreground">Status: </span>
                  <span className="capitalize">{booking.payment.status.replace(/_/g, " ")}</span>
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
