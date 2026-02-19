"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useStripeAccount,
  useStripeOnboarding,
  useStripeDashboard,
} from "@/hooks/api/use-stripe-account";
import { ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function StripeConnectCard() {
  const {
    data: account,
    isLoading,
    isError,
    error,
  } = useStripeAccount();

  const onboarding = useStripeOnboarding();
  const dashboard = useStripeDashboard();

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

  const handleDashboard = async () => {
    try {
      const result = await dashboard.mutateAsync();
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch {
      // Error is handled by the mutation state
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="rounded-3xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Checking Stripe account status…
          </span>
        </div>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="rounded-3xl border bg-white p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">
            {(error as Error)?.message || "Unable to load Stripe status"}
          </span>
        </div>
      </Card>
    );
  }

  const isFullyOnboarded =
    account?.chargesEnabled &&
    account?.payoutsEnabled &&
    account?.detailsSubmitted;

  return (
    <Card className="rounded-3xl border bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Status info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              Stripe Connect
            </h3>
            {isFullyOnboarded ? (
              <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Action Required
              </Badge>
            )}
          </div>

          {isFullyOnboarded ? (
            <p className="text-sm text-muted-foreground">
              Your Stripe account is fully connected. You can receive payments and payouts.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Complete Stripe onboarding to start receiving payments.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <StatusFlag label="Details Submitted" ok={account?.detailsSubmitted} />
                <StatusFlag label="Charges Enabled" ok={account?.chargesEnabled} />
                <StatusFlag label="Payouts Enabled" ok={account?.payoutsEnabled} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Action */}
        {!isFullyOnboarded ? (
          <Button
            onClick={handleOnboard}
            disabled={onboarding.isPending}
            className="shrink-0"
          >
            {onboarding.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Onboard to Stripe
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleDashboard}
            disabled={dashboard.isPending}
            className="shrink-0"
          >
             {dashboard.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Login to Stripe
          </Button>
        )}
      </div>

      {(onboarding.isError || dashboard.isError) && (
        <p className="mt-3 text-sm text-destructive">
          {(onboarding.error as Error)?.message || (dashboard.error as Error)?.message || "Failed to process request"}
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
