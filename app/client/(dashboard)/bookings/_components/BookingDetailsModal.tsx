"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Users, CreditCard, ExternalLink } from "lucide-react";
import type { BookingResponse, PopulatedVendorSpecialty } from "@/types/booking";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  paid: {
    label: "Paid",
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

type BookingDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  booking: BookingResponse;
  vendorBusinessName?: string;
  vendorRating?: number;
  serviceNamesMap?: Record<string, string>;
  formattedTotal: string;
};

export function BookingDetailsModal({
  open,
  onClose,
  booking,
  vendorBusinessName,
  vendorRating,
  serviceNamesMap = {},
  formattedTotal,
}: BookingDetailsModalProps) {
  const status = statusConfig[booking.status] || statusConfig.pending;
  
  const formattedStartDate = format(
    new Date(booking.eventDetails.startDate),
    "MMM dd, yyyy"
  );
  
  const formattedEndDate = format(
    new Date(booking.eventDetails.endDate),
    "MMM dd, yyyy"
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl">{booking.eventDetails.title}</DialogTitle>
            <Badge variant="outline" className={cn("font-medium", status.color)}>
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Booking ID: #{booking._id.slice(-8).toUpperCase()}
          </p>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Event Details & Location */}
          <div className="space-y-6">
            <section className="space-y-3">
              <h4 className="font-semibold text-foreground border-b pb-2">Event Details</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Date & Time</p>
                    <p>{formattedStartDate} {formattedStartDate !== formattedEndDate ? ` to ${formattedEndDate}` : ""}</p>
                    <p>{format(new Date(booking.eventDetails.startDate), "h:mm a")} - {format(new Date(booking.eventDetails.endDate), "h:mm a")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0" />
                  <p><span className="font-medium text-foreground">Guests:</span> {booking.eventDetails.guestCount}</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p>{booking.location.addressText}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold text-foreground border-b pb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {booking.eventDetails.description || "No description provided."}
              </p>
            </section>
          </div>

          {/* Right Column: Vendor & Financials */}
          <div className="space-y-6 bg-muted/50 p-4 rounded-xl border">
            <section className="space-y-3">
              <h4 className="font-semibold text-foreground border-b pb-2">Vendor Information</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground text-base">
                  {vendorBusinessName || "Unknown Vendor"}
                </p>
                {vendorRating !== undefined && vendorRating > 0 && (
                  <p>Rating: {vendorRating.toFixed(1)} ⭐</p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold text-foreground border-b pb-2">Services & Budget</h4>
              <div className="space-y-3 text-sm">
                {(booking.budgetAllocations || []).map((allocation, idx) => {
                  const specialty = allocation.vendorSpecialtyId as PopulatedVendorSpecialty;
                  const rawId = specialty?.serviceSpecialty;
                  const readableName = (rawId && serviceNamesMap[rawId]) || rawId || `Service ${idx + 1}`;
                  
                  const budgetFormatted = new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: booking.currency || "GBP",
                  }).format(allocation.budgetedAmount);

                  return (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium text-foreground">{readableName}</p>
                        <p className="text-xs text-muted-foreground">
                          Rate: {specialty?.priceCharge ? specialty.priceCharge.replace(/_/g, " ") : "TBD"}
                        </p>
                      </div>
                      <p className="font-medium">{budgetFormatted}</p>
                    </div>
                  );
                })}

                <div className="pt-3 border-t flex justify-between items-center font-bold text-base text-foreground mt-4">
                  <p>Total Budget</p>
                  <p>{formattedTotal}</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold text-foreground border-b pb-2">Payment Details</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <p>
                    <span className="font-medium text-foreground">Model:</span>{" "}
                    <span className="capitalize">{booking.paymentModel.replace(/_/g, " ")}</span>
                  </p>
                </div>
                {booking.payment?.status && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 shrink-0" /> {/* Spacer */}
                    <p>
                      <span className="font-medium text-foreground">Status:</span>{" "}
                      <span className="capitalize">{booking.payment.status.replace(/_/g, " ")}</span>
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
