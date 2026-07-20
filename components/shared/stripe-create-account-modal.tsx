"use client";

import { useEffect, useMemo, useState } from "react";
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
  isLoadingCountries?: boolean;
  isCreating?: boolean;
  onConfirm: (country: string) => Promise<void> | void;
}

export function StripeCreateAccountModal({
  open,
  onOpenChange,
  countries,
  isLoadingCountries = false,
  isCreating = false,
  onConfirm,
}: StripeCreateAccountModalProps) {
  const defaultCountry = useMemo(() => countries?.[0] ?? null, [countries]);
  const [selectedCountry, setSelectedCountry] = useState<StripeCountry | null>(null);

  useEffect(() => {
    if (!open) return;

    const initialCountry = selectedCountry ?? defaultCountry;
    if (initialCountry) {
      setSelectedCountry(initialCountry);
    }
  }, [open, defaultCountry, selectedCountry]);

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
            Select the country for the connected account before creating it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoadingCountries ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              Loading countries...
            </div>
          ) : (
            <select
              value={selectedCountry?.code ?? ""}
              onChange={(event) => {
                const country = countries?.find(
                  (item) => item.code === event.target.value,
                );
                setSelectedCountry(country ?? null);
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select a country
              </option>
              {countries?.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
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