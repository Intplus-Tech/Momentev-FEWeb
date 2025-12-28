import {
  bankAccountDetails,
  earningsBreakdown,
  payoutHistory,
  summaryMetrics,
  transactionMeta,
  transactions,
  upcomingPayouts,
} from "./data";

import { BankAccountCard } from "./_components/bank-account-card";
import { NetEarningsCard } from "./_components/net-earnings-card";
import { SummaryMetricsGrid } from "./_components/summary-metrics-grid";
import { TransactionHistoryTable } from "./_components/transaction-history-table";
import { UpcomingPayoutsCard } from "./_components/upcoming-payouts-card";
import { PayoutHistoryTable } from "./_components/payout-history-table";

export default function VendorPaymentPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track your earnings and expenses
        </p>
      </div>

      <SummaryMetricsGrid metrics={summaryMetrics} />
      <BankAccountCard details={bankAccountDetails} />

      <div className="grid gap-4 lg:grid-cols-2">
        <NetEarningsCard items={earningsBreakdown} />
        <UpcomingPayoutsCard payouts={upcomingPayouts} />
      </div>

      <PayoutHistoryTable rows={payoutHistory} />
      <TransactionHistoryTable rows={transactions} meta={transactionMeta} />
    </section>
  );
}
