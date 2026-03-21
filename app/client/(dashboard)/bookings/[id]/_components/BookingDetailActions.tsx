"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, CreditCard, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { PaymentModal } from "../../_components/PaymentModal";
import { CreateDisputeModal } from "../../_components/CreateDisputeModal";
import type { BookingResponse } from "@/types/booking";

type Props = {
  booking: BookingResponse;
  vendorId: string;
  formattedTotal: string;
};

export function BookingDetailActions({ booking, vendorId, formattedTotal }: Props) {
  const router = useRouter();
  const [isMessaging, setIsMessaging] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  const showCancelButton = booking.status === "pending_payment";
  const showPayButton = booking.status === "pending_payment";
  const showDisputeButton = ["paid", "confirmed", "completed"].includes(booking.status);

  const handleMessageVendor = async () => {
    if (isMessaging) return;
    setIsMessaging(true);
    try {
      const result = await getOrCreateConversation(vendorId);
      if (result.success && result.data) {
        router.push(`/client/messages/${result.data._id}`);
      } else {
        toast.error("Failed to open conversation");
      }
    } catch {
      toast.error("Failed to open conversation");
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
        toast.success("Booking cancelled successfully.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel booking");
      }
    } catch {
      toast.error("An unexpected error occurred while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleMessageVendor}
          disabled={isMessaging || isCancelling}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {isMessaging ? "Loading..." : "Message Vendor"}
        </Button>

        {showPayButton && (
          <Button onClick={() => setIsPaymentOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </Button>
        )}

        {showDisputeButton && (
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={() => setIsDisputeOpen(true)}
          >
            Dispute Booking
          </Button>
        )}

        {showCancelButton && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isCancelling}>
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelBooking();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {showPayButton && booking.status === "pending_payment" && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-400 mt-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Payment is required to confirm this booking.</p>
        </div>
      )}

      <PaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        bookingId={booking._id}
        formattedTotal={formattedTotal}
        eventTitle={booking.eventDetails.title}
      />

      <CreateDisputeModal
        booking={booking}
        open={isDisputeOpen}
        onOpenChange={setIsDisputeOpen}
      />
    </>
  );
}
