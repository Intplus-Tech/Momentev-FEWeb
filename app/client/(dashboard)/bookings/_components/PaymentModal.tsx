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
import {
  getCustomerPaymentMethods,
  type CustomerPaymentMethod,
} from "@/lib/actions/customer-payment";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
// Success View
// ─────────────────────────────────────────────
function SuccessView() {
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

  // Saved payment methods states
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("new_card");
  const [isChargingSavedCard, setIsChargingSavedCard] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // Fetch payment methods when modal opens
  useEffect(() => {
    if (!open) return;
    
    // Reset states
    setClientSecret(null);
    setInitError(null);
    setSucceeded(false);
    setSelectedMethod("new_card");
    setIsLoading(true);

    const init = async () => {
      try {
        // 1. Fetch saved payment methods
        const pmResult = await getCustomerPaymentMethods();
        if (pmResult.success && pmResult.data?.paymentMethods?.length) {
          const methods = pmResult.data.paymentMethods;
          setPaymentMethods(methods);
          
          // Auto-select the first card (which is usually default)
          if (methods.length > 0) {
            setSelectedMethod(methods[0].id);
          }
        } else {
          setPaymentMethods([]);
        }

        // 2. Fetch generic payment intent for "New Card"
        const piResult = await createPaymentIntent(bookingId);
        if (piResult.success && piResult.data?.clientSecret) {
          setClientSecret(piResult.data.clientSecret);
        } else {
          setInitError(piResult.error ?? "Failed to initialise payment.");
        }
      } catch (error) {
        setInitError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [open, bookingId]);

  const handleSuccess = () => {
    router.refresh();
  };

  const stripePromise = getStripe();

  const handlePayWithSavedCard = async () => {
    if (!selectedMethod || selectedMethod === "new_card" || !clientSecret || !stripePromise) return;
    
    setIsChargingSavedCard(true);
    setInitError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        setInitError("Stripe failed to load");
        setIsChargingSavedCard(false);
        return;
      }

      // 1. Confirm the card payment with Stripe.js using the saved payment method
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedMethod,
      });
      
      if (stripeError) {
        setInitError(stripeError.message ?? "Payment failed with the selected card.");
        setIsChargingSavedCard(false);
        return;
      }

      if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
        // 2. After successful Stripe confirmation, tell our backend to confirm the booking
        const bgConfirm = await confirmBookingPayment(bookingId);
        if (!bgConfirm.success) {
          setInitError(bgConfirm.error ?? "Payment charged, but failed to confirm booking locally.");
          setIsChargingSavedCard(false);
          return;
        }

        setSucceeded(true);
        setTimeout(() => {
          handleSuccess();
          onClose();
        }, 1500);
      } else {
        setInitError(`Unexpected payment status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      setInitError("An unexpected error occurred while charging the card.");
    } finally {
      setIsChargingSavedCard(false);
    }
  };

  const getBrandLabel = (brand: string) => {
    const b = brand.toLowerCase();
    if (b === "visa") return "Visa";
    if (b === "mastercard") return "Mastercard";
    if (b === "amex") return "Amex";
    if (b === "discover") return "Discover";
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[600px] overflow-y-scroll no-scrollbar">
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

        {succeeded && <SuccessView />}

        {!isLoading && !succeeded && clientSecret && (
          <div className="space-y-6 pt-2">
            {paymentMethods.length > 0 && (
              <RadioGroup
                value={selectedMethod}
                onValueChange={setSelectedMethod}
                className="space-y-3"
              >
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center space-x-3 rounded-md border border-border p-3">
                    <RadioGroupItem value={pm.id} id={`pm-${pm.id}`} />
                    <Label htmlFor={`pm-${pm.id}`} className="flex flex-1 cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {pm.card ? getBrandLabel(pm.card.brand) : "Card"} •••• {pm.card?.last4}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {pm.card ? `${String(pm.card.exp_month).padStart(2, "0")}/${pm.card.exp_year}` : ""}
                      </span>
                    </Label>
                  </div>
                ))}
                
                <div className="flex items-center space-x-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="new_card" id="pm-new_card" />
                  <Label htmlFor="pm-new_card" className="flex flex-1 cursor-pointer items-center">
                    Pay with a different card
                  </Label>
                </div>
              </RadioGroup>
            )}

            {selectedMethod === "new_card" ? (
              <div className={paymentMethods.length > 0 ? "pt-2 border-t border-border" : ""}>
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
              </div>
            ) : (
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isChargingSavedCard}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayWithSavedCard} 
                  disabled={isChargingSavedCard}
                >
                  {isChargingSavedCard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Saved Card
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
