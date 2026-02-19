"use client";

import { useMemo } from "react";
import {
  CalendarClock,
  Hourglass,
  ShieldCheck,
  Wallet2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  useVendorBalance,
  useVendorEarnings,
  useVendorPayouts,
  useVendorPaymentMethods,
} from "@/hooks/api/use-vendor-payments";

import { SummaryMetricsGrid } from "./summary-metrics-grid";
import { PayoutHistoryTable } from "./payout-history-table";
import { TransactionHistoryTable } from "./transaction-history-table";
import { BankAccountCard } from "./bank-account-card";

import type { SummaryMetric, PayoutHistoryRow, TransactionRow } from "../data";

// ── helpers ──────────────────────────────────────────────────

/** Stripe amounts are in cents — convert to dollars. */
function cents(amount: number) {
  return amount / 100;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(epoch: number) {
  return new Date(epoch * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── component ────────────────────────────────────────────────

export function PaymentContent() {
  const balance = useVendorBalance();
  const earnings = useVendorEarnings();
  const payouts = useVendorPayouts();

  const isLoading = balance.isLoading || earnings.isLoading || payouts.isLoading;
  const hasError = balance.isError || earnings.isError || payouts.isError;

  // ── Summary metrics ──
  const summaryMetrics: SummaryMetric[] = useMemo(() => {
    const cur = balance.data?.currency ?? "usd";
    const availableBal = cents(balance.data?.available ?? 0);
    const pendingBal = cents(balance.data?.pending ?? 0);

    const totalEarnings = earnings.data?.earnings
      ? cents(
          earnings.data.earnings.reduce((sum, e) => sum + e.amount, 0),
        )
      : 0;

    const totalPayouts = payouts.data?.payouts
      ? cents(
          payouts.data.payouts.reduce((sum, p) => sum + p.amount, 0),
        )
      : 0;

    return [
      {
        label: "Available Balance",
        value: formatCurrency(availableBal, cur),
        change: "Funds ready for payout",
        icon: ShieldCheck,
      },
      {
        label: "Pending Balance",
        value: formatCurrency(pendingBal, cur),
        change: "Funds in transit",
        icon: Hourglass,
      },
      {
        label: "Total Earnings",
        value: formatCurrency(totalEarnings, cur),
        change: `${earnings.data?.total ?? 0} transaction${(earnings.data?.total ?? 0) !== 1 ? "s" : ""}`,
        icon: Wallet2,
      },
      {
        label: "Total Payouts",
        value: formatCurrency(totalPayouts, cur),
        change: `${payouts.data?.payouts?.length ?? 0} payout${(payouts.data?.payouts?.length ?? 0) !== 1 ? "s" : ""}`,
        icon: CalendarClock,
      },
    ];
  }, [balance.data, earnings.data, payouts.data]);

  // ── Transaction rows (from earnings) ──
  const transactionRows: TransactionRow[] = useMemo(() => {
    if (!earnings.data?.earnings) return [];
    const cur = earnings.data.earnings[0]?.currency ?? "usd";

    return earnings.data.earnings.map((e) => ({
      id: e.id,
      date: formatDate(e.created),
      isoDate: new Date(e.created * 1000).toISOString().split("T")[0],
      type: capitalize(e.type),
      subLabel: capitalize(e.type),
      client: "—",
      amount: formatCurrency(cents(e.amount), cur),
      fee: "—",
      net: formatCurrency(cents(e.amount), cur),
      status: "Completed",
      statusDetail: "",
    }));
  }, [earnings.data]);

  const transactionMeta = useMemo(
    () => ({
      summary: `${earnings.data?.total ?? 0} Transaction${(earnings.data?.total ?? 0) !== 1 ? "s" : ""}`,
    }),
    [earnings.data],
  );

  // ── Payout rows (from payouts) ──
  const payoutRows: PayoutHistoryRow[] = useMemo(() => {
    if (!payouts.data?.payouts) return [];
    const cur = payouts.data.payouts[0]?.currency ?? "usd";

    return payouts.data.payouts.map((p) => ({
      date: formatDate(p.arrival_date),
      payoutId: p.id,
      amount: formatCurrency(cents(p.amount), cur),
      status: (capitalize(p.status) === "Paid" ? "Completed" : "Pending") as
        | "Completed"
        | "Pending",
      bankAccount: "—",
    }));
  }, [payouts.data]);

  // ── Payment Methods ──
  const paymentMethodsData = useVendorPaymentMethods();

  // ── Loading state ──
  if (isLoading || paymentMethodsData.isLoading) {
    return (
      <Card className="rounded-3xl border bg-white p-10">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading payment data…
          </span>
         </div>
      </Card>
    );
  }

  // ── Error state ──
  if (hasError || paymentMethodsData.isError) {
    return (
      <Card className="rounded-3xl border bg-white p-10">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">
            {(balance.error as Error)?.message ||
              (earnings.error as Error)?.message ||
              (payouts.error as Error)?.message ||
              (paymentMethodsData.error as Error)?.message ||
              "Unable to load payment data"}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryMetricsGrid metrics={summaryMetrics} />
      {paymentMethodsData.data?.paymentMethods && (
        <BankAccountCard
          paymentMethods={paymentMethodsData.data.paymentMethods}
        />
      )}
      <TransactionHistoryTable rows={transactionRows} meta={transactionMeta} />
      <PayoutHistoryTable rows={payoutRows} />
    </div>
  );
}
