"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { addCustomerPaymentMethod } from "@/lib/actions/customer-payment";
import { Loader2 } from "lucide-react";

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Card element not found");
        setIsLoading(false);
        return;
      }

      // Create the payment method via Stripe.js
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (stripeError) {
        setError(stripeError.message || "Failed to create payment method");
        setIsLoading(false);
        return;
      }

      if (!paymentMethod) {
        setError("No payment method returned");
        setIsLoading(false);
        return;
      }

      // Send the pm_... token to our backend
      const result = await addCustomerPaymentMethod(paymentMethod.id);

      if (!result.success) {
        setError(result.error || "Failed to save payment method");
        setIsLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border p-4 bg-background">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "hsl(var(--foreground))",
                "::placeholder": {
                  color: "hsl(var(--muted-foreground))",
                },
              },
              invalid: {
                color: "#ef4444",
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Card"
          )}
        </Button>
      </div>
    </form>
  );
}

type AddPaymentMethodModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddPaymentMethodModal({
  open,
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const stripePromise = getStripe();

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Enter your card details below. Your information is securely processed by Stripe.
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <AddCardForm onSuccess={handleSuccess} onCancel={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
