"use client";

import { Building2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { VendorPaymentMethod } from "@/lib/actions/payment";

interface BankAccountCardProps {
  paymentMethods: VendorPaymentMethod[];
}

export function BankAccountCard({ paymentMethods }: BankAccountCardProps) {
  // We'll just show the first bank account if multiple exist, or map them all.
  // The API returns a list, so let's handle the empty case or list case.
  
  if (!paymentMethods || paymentMethods.length === 0) {
    return null; // Don't show the card if no payment methods are linked
  }

  // Assuming we just want to show the list of attached bank accounts
  return (
    <Card className="rounded-3xl border bg-white p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Payout Methods
        </h3>
        <p className="text-sm text-muted-foreground">
          Bank accounts connected for payouts
        </p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#2F6BFF]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {method.bank_name} •••• {method.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  {method.currency.toUpperCase()} — {method.object}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-transparent bg-[#E6F7F1] px-2 py-0.5 text-xs font-medium text-[#078B54] hover:bg-[#E6F7F1]"
              >
                {method.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
