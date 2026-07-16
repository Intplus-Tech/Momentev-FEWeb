"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useStripeAccount,
  useStripeOnboarding,
  useStripeDashboard,
} from "@/hooks/api/use-stripe-account";
import { createStripeAccount, type PaymentActionResponse } from "@/lib/actions/payment";
import { queryKeys } from "@/lib/react-query/keys";
import { AlertTriangle, CheckCircle2, AlertCircle, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";

export function StripeConnectBanner() {
  const queryClient = useQueryClient();
  const { data: account, isLoading, isError } = useStripeAccount();
  const onboarding = useStripeOnboarding();
  const dashboard = useStripeDashboard();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const isFullyOnboarded =
    Boolean(account) &&
    account?.chargesEnabled &&
    account?.payoutsEnabled &&
    account?.detailsSubmitted;
  const hasStripeAccount = Boolean(account?.stripeAccountId);
  const isStripeIncomplete = hasStripeAccount && !isFullyOnboarded;

  const handleCreateAccount = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    setIsCreatingAccount(true);
    try {
      const result: PaymentActionResponse<{ stripeAccountId: string }> =
        await createStripeAccount();

      if (!result.success) {
        throw new Error(result.error || "Failed to create Stripe account");
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.vendor.stripeAccount(),
      });
    } catch {
      // Error is surfaced below from query/mutation state or toast handling elsewhere.
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleGoToStripe = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    try {
      const result = await onboarding.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      // Error is handled by the mutation state
    }
  };

  const handleOpenDashboard = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    try {
      const result = await dashboard.mutateAsync();
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch {
      // Error is handled by the mutation state
    }
  };

  if (isLoading) return null;
  if (isFullyOnboarded) return null;

  return (
    <Card className="relative overflow-hidden rounded-3xl border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-900">
              {hasStripeAccount ? "Finish Your Stripe Setup" : "Create Your Stripe Account"}
            </h3>
            <p className="text-sm leading-relaxed text-amber-800/80">
              {hasStripeAccount
                ? "Your Stripe account exists, but onboarding is not complete yet. Finish it now so you can receive payments from clients."
                : "You do not have a Stripe account yet. Create one first, then come back here to finish onboarding and enable payments."}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-amber-800/70">
              <StatusFlag label="Details Submitted" ok={account?.detailsSubmitted} />
              <StatusFlag label="Charges Enabled" ok={account?.chargesEnabled} />
              <StatusFlag label="Payouts Enabled" ok={account?.payoutsEnabled} />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-amber-700/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure &amp; instant — powered by Stripe</span>
            </div>
          </div>
        </div>

        <Button
          onClick={hasStripeAccount ? handleGoToStripe : handleCreateAccount}
          disabled={
            Boolean(restriction) ||
            onboarding.isPending ||
            dashboard.isPending ||
            isCreatingAccount
          }
          className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
        >
          {isCreatingAccount || onboarding.isPending || dashboard.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="mr-2 h-4 w-4" />
          )}
          {isStripeIncomplete ? "Continue Stripe Setup" : "Create Stripe Account"}
        </Button>
      </div>

      {onboarding.isError && (
        <p className="mt-3 text-sm text-destructive">
          {(onboarding.error as Error)?.message || "Failed to start onboarding. Please try again."}
        </p>
      )}

      {dashboard.isError && (
        <p className="mt-3 text-sm text-destructive">
          {(dashboard.error as Error)?.message || "Failed to open dashboard. Please try again."}
        </p>
      )}

      <VendorActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={setShowBlockedDialog}
        restriction={restriction}
      />
    </Card>
  );
}

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
