"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getStripe } from "@/lib/stripe";
import {
  createPaymentIntent,
  confirmBookingPayment,
} from "@/lib/actions/payment";

// ─────────────────────────────────────────────
// Inner form — rendered inside <Elements>
// ─────────────────────────────────────────────

function CheckoutForm({
  bookingId,
  onSuccess,
  onClose,
}: {
  bookingId: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    console.log("[PaymentModal] Starting payment process...");
    setIsProcessing(true);
    setError(null);

    // Step 1: confirm the payment with Stripe.js (charges the card)
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      console.error("[PaymentModal] Stripe confirmation error:", stripeError);
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    console.log("[PaymentModal] Stripe charge successful. Syncing with backend...");

    // Step 2: tell our backend the payment succeeded → updates booking status
    const confirmResult = await confirmBookingPayment(bookingId);
    if (!confirmResult.success) {
      console.error("[PaymentModal] Backend confirmation failed:", confirmResult.error);
      setError(
        confirmResult.error ??
          "Payment was charged but we could not confirm your booking. Please contact support."
      );
      setIsProcessing(false);
      return;
    }

    console.log("[PaymentModal] Booking fully confirmed!");
    setSucceeded(true);
    setIsProcessing(false);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <ShieldCheck className="h-7 w-7 text-green-600" />
        </div>
        <p className="text-lg font-semibold text-foreground">Payment successful!</p>
        <p className="text-sm text-muted-foreground">
          Your booking has been confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────
// Wrapper — fetches clientSecret, then renders Elements
// ─────────────────────────────────────────────

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  formattedTotal: string;
  eventTitle: string;
};

export function PaymentModal({
  open,
  onClose,
  bookingId,
  formattedTotal,
  eventTitle,
}: PaymentModalProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the PaymentIntent clientSecret each time the modal opens
  useEffect(() => {
    if (!open) return;
    setClientSecret(null);
    setInitError(null);
    setIsLoading(true);

    createPaymentIntent(bookingId)
      .then((result) => {
        if (result.success && result.data?.clientSecret) {
          setClientSecret(result.data.clientSecret);
        } else {
          setInitError(result.error ?? "Failed to initialise payment.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [open, bookingId]);

  const handleSuccess = () => {
    router.refresh();
  };

  const stripePromise = getStripe();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{eventTitle}</span>
            {" · "}
            <span>{formattedTotal}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {initError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{initError}</AlertDescription>
          </Alert>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#6366f1",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutForm
              bookingId={bookingId}
              onSuccess={handleSuccess}
              onClose={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
