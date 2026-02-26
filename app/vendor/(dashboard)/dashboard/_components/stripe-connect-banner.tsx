"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useStripeAccount,
  useStripeOnboarding,
} from "@/hooks/api/use-stripe-account";
import { AlertTriangle, CheckCircle2, AlertCircle, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

export function StripeConnectBanner() {
  const { data: account, isLoading, isError } = useStripeAccount();
  const onboarding = useStripeOnboarding();

  const handleOnboard = async () => {
    try {
      const result = await onboarding.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      // Error is handled by the mutation state
    }
  };

  // Don't show anything while loading
  if (isLoading) return null;

  const isFullyOnboarded =
    account?.chargesEnabled &&
    account?.payoutsEnabled &&
    account?.detailsSubmitted;

  // Don't show the banner if already fully connected
  if (isFullyOnboarded) return null;

  // Show banner when: error fetching account, no account, or account not fully onboarded

  return (
    <Card className="relative overflow-hidden rounded-3xl border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5">
      {/* Decorative accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Message */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Connect Your Stripe Account
            </h3>
            <p className="text-sm leading-relaxed text-amber-800/80">
              You need a connected Stripe account to receive payments from
              clients. Set it up now so you never miss a booking payment.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-amber-800/70">
              <StatusFlag label="Details Submitted" ok={account?.detailsSubmitted} />
              <StatusFlag label="Charges Enabled" ok={account?.chargesEnabled} />
              <StatusFlag label="Payouts Enabled" ok={account?.payoutsEnabled} />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-amber-700/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                Secure &amp; instant — powered by Stripe
              </span>
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        <Button
          onClick={handleOnboard}
          disabled={onboarding.isPending}
          className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
        >
          {onboarding.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="mr-2 h-4 w-4" />
          )}
          Connect Stripe
        </Button>
      </div>

      {onboarding.isError && (
        <p className="mt-3 text-sm text-destructive">
          {(onboarding.error as Error)?.message ||
            "Failed to start onboarding. Please try again."}
        </p>
      )}
    </Card>
  );
}

// --- Helper component ---

function StatusFlag({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
      )}
      {label}
    </span>
  );
}
