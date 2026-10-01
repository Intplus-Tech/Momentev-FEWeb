"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StripeCountry } from "@/lib/actions/payment";

interface StripeCreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries?: StripeCountry[];
  fixedCountryCode?: string;
  isLoadingCountries?: boolean;
  isCreating?: boolean;
  onConfirm: (country: string) => Promise<void> | void;
}

export function StripeCreateAccountModal({
  open,
  onOpenChange,
  countries,
  fixedCountryCode,
  isLoadingCountries = false,
  isCreating = false,
  onConfirm,
}: StripeCreateAccountModalProps) {
  const defaultCountry = useMemo(
    () => countries?.find((country) => country.code.toUpperCase() === "GB") ?? null,
    [countries],
  );
  const countryOptions = useMemo(
    () =>
      [...(countries ?? [])].sort((first, second) => {
        if (first.code.toUpperCase() === "GB") return -1;
        if (second.code.toUpperCase() === "GB") return 1;
        return first.name.localeCompare(second.name);
      }),
    [countries],
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const fixedCountry = fixedCountryCode
    ? countries?.find((country) => country.code.toUpperCase() === fixedCountryCode.toUpperCase()) ?? null
    : null;
  const selectedCountry = fixedCountryCode
    ? fixedCountry
    : countries?.find((country) => country.code.toUpperCase() === selectedCountryCode?.toUpperCase()) ??
    defaultCountry;

  const handleConfirm = async () => {
    if (!selectedCountry) return;
    await onConfirm(selectedCountry.code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your Stripe country</DialogTitle>
          <DialogDescription>
            {fixedCountryCode === "GB"
              ? "Your Stripe account will be registered in the United Kingdom (GB) with GBP as its default currency."
              : "Select the country where your business is legally registered. UK businesses should choose United Kingdom (GB), not Gibraltar (GI)."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoadingCountries ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              Loading countries...
            </div>
          ) : fixedCountryCode ? (
            selectedCountry ? (
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                United Kingdom (GB) <span className="text-muted-foreground">(GBP)</span>
              </div>
            ) : (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                United Kingdom is not currently available for Stripe Connect. Please try again later or contact support.
              </p>
            )
          ) : (
            <select
              value={selectedCountry?.code ?? ""}
              onChange={(event) => {
                setSelectedCountryCode(event.target.value || null);
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select a country
              </option>
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                  {country.defaultCurrency ? ` - ${country.defaultCurrency}` : ""}
                </option>
              ))}
            </select>
          )}

          {selectedCountry && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              Selected: <span className="font-medium">{selectedCountry.name}</span>
              {selectedCountry.defaultCurrency ? (
                <span className="text-muted-foreground">
                  {" "}
                  ({selectedCountry.defaultCurrency})
                </span>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCountry || isCreating || isLoadingCountries}
          >
            {isCreating ? (
              "Creating..."
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}