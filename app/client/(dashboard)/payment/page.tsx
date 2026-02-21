"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Plus, Star, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  getCustomerPaymentMethods,
  setDefaultPaymentMethod,
  type CustomerPaymentMethod,
} from "@/lib/actions/customer-payment";
import { AddPaymentMethodModal } from "./_components/AddPaymentMethodModal";

function getBrandIcon(brand: string) {
  const b = brand.toLowerCase();
  if (b === "visa") return "💳 Visa";
  if (b === "mastercard") return "💳 Mastercard";
  if (b === "amex") return "💳 Amex";
  if (b === "discover") return "💳 Discover";
  return `💳 ${brand.charAt(0).toUpperCase() + brand.slice(1)}`;
}

export default function ClientPaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethod[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomerPaymentMethods();
      if (result.success && result.data) {
        setPaymentMethods(result.data.paymentMethods || []);
      } else {
        setError(result.error || "Failed to load payment methods");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleSetDefault = async (paymentMethodId: string) => {
    setSettingDefaultId(paymentMethodId);
    try {
      const result = await setDefaultPaymentMethod(paymentMethodId);
      if (result.success) {
        await fetchMethods();
      } else {
        setError(result.error || "Failed to set default");
      }
    } catch {
      setError("Failed to set default payment method");
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage your saved payment methods
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Payment Methods
          </h1>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-xl">Saved Cards</CardTitle>
          <CardDescription>
            Cards saved for booking payments. Your default card will be used
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading payment methods...
              </span>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                No payment methods saved
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a card to start making payments for your bookings.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first card
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, idx) => {
                const isFirst = idx === 0; // First card is typically the default
                const isSettingDefault = settingDefaultId === method.id;

                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {method.card
                              ? getBrandIcon(method.card.brand)
                              : "Card"}{" "}
                            •••• {method.card?.last4 || "????"}
                          </p>
                          {isFirst && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary"
                            >
                              <Star className="mr-1 h-3 w-3" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.card
                            ? `Expires ${String(method.card.exp_month).padStart(2, "0")}/${method.card.exp_year}`
                            : "Unknown expiry"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isFirst && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          disabled={isSettingDefault}
                        >
                          {isSettingDefault ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Set as Default"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMethods}
      />
    </section>
  );
}
