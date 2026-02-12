"use client";

import { Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { getOrCreateConversation } from "@/lib/actions/chat";
import { cancelBooking } from "@/lib/actions/booking";
import type {
  BookingResponse,
  PopulatedVendor,
  PopulatedVendorSpecialty,
} from "@/types/booking";

type BookingCardProps = {
  booking: BookingResponse;
  vendorBusinessName?: string;
  vendorRating?: number;
};

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
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
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export function BookingCard({
  booking,
  vendorBusinessName,
  vendorRating,
}: BookingCardProps) {
  const router = useRouter();
  const [isMessaging, setIsMessaging] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const vendor = booking.vendorId as PopulatedVendor;
  const vendorId = typeof vendor === "string" ? vendor : vendor._id;

  // Format dates
  const startDate = new Date(booking.eventDetails.startDate);
  const endDate = new Date(booking.eventDetails.endDate);
  const formattedStartDate = format(startDate, "MMM dd, yyyy");
  const formattedEndDate = format(endDate, "MMM dd, yyyy");

  // Get status configuration
  const status = statusConfig[booking.status] || statusConfig.pending;

  // Get service count and budget total
  const serviceCount = booking.budgetAllocations.length;
  const totalBudget = booking.budgetAllocations.reduce(
    (sum, allocation) => sum + allocation.budgetedAmount,
    0,
  );

  // Format currency
  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: booking.currency || "GBP",
  }).format(booking.amounts.total || totalBudget);

  const handleMessageVendor = async () => {
    if (isMessaging) return;

    setIsMessaging(true);
    try {
      const result = await getOrCreateConversation(vendorId);

      if (result.success && result.data) {
        // Navigate to the conversation
        router.push(`/client/messages/${result.data._id}`);
      } else {
        console.error("Failed to create conversation:", result.error);
        // Could show a toast notification here
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsMessaging(false);
    }
  };

  const handleCancelBooking = async () => {
    if (isCancelling) return;

    setIsCancelling(true);
    try {
      const result = await cancelBooking(booking._id);

      if (result.success) {
        router.refresh();
      } else {
        console.error("Failed to cancel booking:", result.error);
        alert(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const showCancelButton = booking.status === "pending_payment";

  return (
    <Card className="border border-border/70 hover:shadow-md transition-shadow">
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                {booking.eventDetails.title}
              </h3>
              <Badge
                variant="outline"
                className={cn("font-medium", status.color)}
              >
                {status.label}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Event Details
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {booking._id && (
                  <p className="line-clamp-2 mt-2">
                    <span className="font-medium text-foreground">
                      Booking ID:
                    </span>{" "}
                    {booking._id}
                  </p>
                )}
                {booking.budgetAllocations.map((allocation, idx) => {
                  const specialty =
                    allocation.vendorSpecialtyId as PopulatedVendorSpecialty;
                  const priceLabel =
                    typeof specialty !== "string"
                      ? `${specialty.priceCharge.replace(/_/g, " ")}: £${specialty.price}`
                      : "Service";

                  return (
                    <p key={idx}>
                      <span className="font-medium text-foreground">
                        Service {idx + 1}:
                      </span>{" "}
                      {priceLabel} (Budget:{" "}
                      {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: booking.currency || "GBP",
                      }).format(allocation.budgetedAmount)}
                      )
                    </p>
                  );
                })}

                {booking.eventDetails.description && (
                  <p className="line-clamp-2 mt-2">
                    <span className="font-medium text-foreground">
                      Description:
                    </span>{" "}
                    {booking.eventDetails.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground md:text-right">
            <div className="flex items-center gap-1.5 md:justify-end">
              <Calendar className="h-4 w-4" />
              <span>{formattedStartDate}</span>
            </div>
            {formattedStartDate !== formattedEndDate && (
              <div className="flex items-center gap-1.5 md:justify-end">
                <span className="text-xs">to</span>
                <span>{formattedEndDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 md:justify-end">
              <Users className="h-4 w-4" />
              <span>{booking.eventDetails.guestCount} guests</span>
            </div>
            <div className="flex items-center gap-1.5 md:justify-end">
              <MapPin className="h-4 w-4" />
              <span>{booking.location.addressText}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[2fr_auto] md:items-end">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {vendorBusinessName || "Vendor"}
            </p>
            {vendorRating !== undefined && vendorRating > 0 && (
              <p>Rating: {vendorRating.toFixed(1)} ⭐</p>
            )}
            <p>
              Total:{" "}
              <span className="font-semibold text-foreground">
                {formattedTotal}
              </span>
            </p>
            <p>
              Payment:{" "}
              <span className="capitalize">
                {booking.paymentModel.replace(/_/g, " ")}
              </span>
            </p>
            <p>Services: {serviceCount} selected</p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            {showCancelButton && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isMessaging || isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this booking? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelBooking();
                      }}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                      {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleMessageVendor}
              disabled={isMessaging || isCancelling}
            >
              {isMessaging ? "Loading..." : "Message Vendor"}
            </Button>
          </div>
        </div>

        {booking.status === "pending_payment" && (
          <div className="flex items-start gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Payment required to confirm this booking</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
