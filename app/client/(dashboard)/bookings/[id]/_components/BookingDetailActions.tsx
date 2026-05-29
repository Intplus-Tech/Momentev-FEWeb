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
import { ClientActionBlockedDialog } from "@/components/shared/client-action-blocked-dialog";
import { useClientActionGuard } from "@/hooks/use-client-action-guard";
import { PaymentModal } from "../../_components/PaymentModal";
import { CreateDisputeModal } from "../../_components/CreateDisputeModal";
import type { BookingResponse } from "@/types/booking";
import { CreateReviewDialog } from "@/app/(home)/search/_vendor-components/CreateReviewDialog";

type Props = {
  booking: BookingResponse;
  vendorId: string;
  formattedTotal: string;
};

export function BookingDetailActions({ booking, vendorId, formattedTotal }: Props) {
  const router = useRouter();
  const { isBanned } = useClientActionGuard();
  const [isMessaging, setIsMessaging] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [blockedRestriction, setBlockedRestriction] = useState<any | null>(null);

  const requiresPayment =
    booking.status === "pending_payment" || booking.status === "awaiting_payment";
  const showCancelButton = requiresPayment;
  const showPayButton = booking.status === "awaiting_payment";
  const showDisputeButton = ["paid", "confirmed", "completed"].includes(booking.status);
  const showLeaveReview = booking.status === "completed";
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleMessageVendor = async () => {
    if (isMessaging) return;
    setIsMessaging(true);
    try {
      const result = await getOrCreateConversation(vendorId);
      if (result.success && result.data) {
        router.push(`/client/messages/${result.data._id}`);
      } else {
        if ((result as any).restriction) {
          setBlockedRestriction((result as any).restriction);
          setShowBlockedDialog(true);
        } else {
          toast.error("Failed to open conversation");
        }
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
          disabled={isMessaging || isCancelling || isBanned}
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

        {showLeaveReview && (
          <Button onClick={() => setIsReviewOpen(true)}>
            Leave a Review
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

      {requiresPayment && (
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

      <CreateReviewDialog
        vendorId={vendorId}
        bookingId={booking._id}
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
      />
      <ClientActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={(open) => {
          if (!open) setBlockedRestriction(null);
          setShowBlockedDialog(open);
        }}
        restriction={blockedRestriction}
      />
    </>
  );
}
