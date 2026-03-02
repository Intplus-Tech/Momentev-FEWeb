"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CreditCard, Loader2, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCustomerPaymentMethods,
  setDefaultPaymentMethod,
  type CustomerPaymentMethod,
} from "@/lib/actions/customer-payment";
import { AddPaymentMethodModal } from "./_components/AddPaymentMethodModal";

const CARD_PALETTES = [
  {
    bg: "bg-gradient-to-br from-gray-100 via-gray-50 to-white",
    text: "text-gray-800",
    subtext: "text-gray-500",
    number: "text-gray-700",
    chip: "from-amber-300 to-yellow-500",
    wave: "rgba(0,0,0,0.04)",
    border: "border-gray-200",
    btnBg: "bg-gray-800/10 hover:bg-gray-800/20 text-gray-800",
  },
  {
    bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
    text: "text-white",
    subtext: "text-gray-400",
    number: "text-gray-200",
    chip: "from-amber-400 to-yellow-500",
    wave: "rgba(255,255,255,0.04)",
    border: "border-gray-700",
    btnBg: "bg-white/15 hover:bg-white/25 text-white",
  },
  {
    bg: "bg-gradient-to-br from-gray-400 via-gray-350 to-gray-300",
    text: "text-gray-900",
    subtext: "text-gray-600",
    number: "text-gray-800",
    chip: "from-amber-300 to-yellow-500",
    wave: "rgba(0,0,0,0.04)",
    border: "border-gray-300",
    btnBg: "bg-gray-900/10 hover:bg-gray-900/20 text-gray-900",
  },
];

function CardChip({ gradient }: { gradient: string }) {
  return (
    <div
      className={`h-8 w-11 rounded-md bg-linear-to-br ${gradient} shadow-sm`}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="grid h-5 w-7 grid-cols-3 gap-px">
          <span className="rounded-sm bg-white/40" />
          <span className="rounded-sm bg-white/25" />
          <span className="rounded-sm bg-white/40" />
          <span className="rounded-sm bg-white/25" />
          <span className="rounded-sm bg-white/40" />
          <span className="rounded-sm bg-white/25" />
        </div>
      </div>
    </div>
  );
}

function BrandLogo({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const b = brand.toLowerCase();

  if (b === "visa") {
    return (
      <span className={`text-xl font-black italic tracking-wider ${className}`}>
        VISA
      </span>
    );
  }

  if (b === "mastercard") {
    return (
      <span className="relative inline-flex h-8 w-14 items-center">
        <span className="absolute left-0 h-8 w-8 rounded-full bg-red-500" />
        <span className="absolute right-0 h-8 w-8 rounded-full bg-amber-400 mix-blend-multiply" />
      </span>
    );
  }

  if (b === "amex") {
    return (
      <span
        className={`text-sm font-bold uppercase tracking-widest ${className}`}
      >
        AMEX
      </span>
    );
  }

  if (b === "discover") {
    return (
      <span
        className={`text-sm font-bold uppercase tracking-widest ${className}`}
      >
        DISCOVER
      </span>
    );
  }

  return (
    <span
      className={`text-sm font-bold uppercase tracking-widest ${className}`}
    >
      {brand}
    </span>
  );
}

function CardWaveSvg({ fill }: { fill: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 400 250"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 180 C80 130, 160 200, 240 160 S400 120, 400 180 L400 250 L0 250 Z"
        fill={fill}
      />
      <path
        d="M0 200 C100 160, 200 230, 300 190 S400 170, 400 200 L400 250 L0 250 Z"
        fill={fill}
      />
    </svg>
  );
}

export default function ClientPaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethod[]>(
    [],
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
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium text-muted-foreground">
                No payment methods saved
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
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
            <div className="space-y-4">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paymentMethods.map((method, idx) => {
                  const isDefault = idx === 0;
                  const isSettingDefault = settingDefaultId === method.id;
                  const brandLabel = method.card?.brand || "Card";
                  const expiry = method.card
                    ? `${String(method.card.exp_month).padStart(2, "0")}/${String(method.card.exp_year).slice(-2)}`
                    : "--/--";
                  const palette = CARD_PALETTES[idx % CARD_PALETTES.length];

                  return (
                    <div
                      key={method.id}
                      className={`group relative aspect-[85.6/53.98] overflow-hidden rounded-2xl ${palette.bg} ${palette.border} border shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
                    >
                      <CardWaveSvg fill={palette.wave} />

                      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                        {/* Top row: chip + brand logo */}
                        <div className="flex items-center justify-between">
                          <CardChip gradient={palette.chip} />
                          <BrandLogo
                            brand={brandLabel}
                            className={palette.text}
                          />
                        </div>

                        {/* Card number */}
                        <div
                          className={`font-mono text-lg font-semibold tracking-[0.25em] sm:text-xl ${palette.number}`}
                        >
                          <span className="opacity-70">****</span>{" "}
                          <span className="opacity-70">****</span>{" "}
                          <span className="opacity-70">****</span>{" "}
                          <span>{method.card?.last4 || "????"}</span>
                        </div>

                        {/* Bottom row: cardholder + expiry + make default */}
                        <div className="flex items-end justify-between">
                          {/* <div className="flex flex-col">
                            <span
                              className={`text-[10px] uppercase tracking-wider ${palette.subtext}`}
                            >
                              Cardholder Name
                            </span>
                            <span
                              className={`text-sm font-semibold ${palette.text}`}
                            >
                              On File
                            </span>
                          </div> */}
                          <div className="flex items-end gap-3">
                            <div className="flex flex-col text-right">
                              {/* <span
                                className={`text-[10px] uppercase tracking-wider ${palette.subtext}`}
                              >
                                Expiry Date
                              </span> */}
                              <span
                                className={`text-sm font-semibold ${palette.text}`}
                              >
                                {expiry}
                              </span>
                            </div>
                            {!isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(method.id)}
                                disabled={isSettingDefault}
                                className={`h-5 border-none text-[10px] shadow-sm ${palette.btnBg}`}
                              >
                                {isSettingDefault ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Make Default"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add card tile */}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex aspect-[85.6/53.98] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl font-medium">
                    +
                  </span>
                  <span className="text-sm font-medium">Add another card</span>
                </button>
              </div>

              {paymentMethods.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>This card is used as default</span>
                </div>
              )}
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
