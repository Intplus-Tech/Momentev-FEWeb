import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Hourglass,
  ShieldCheck,
  Wallet2,
} from "lucide-react";

export type SummaryMetric = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

export type BankAccountDetails = {
  account: string;
  bank: string;
  owner: string;
  lastPayout: string;
};

export type EarningsBreakdownItem = {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
  highlight?: boolean;
};

export type UpcomingPayout = {
  label: string;
  date: string;
  amount: string;
};

export type PayoutHistoryRow = {
  date: string;
  payoutId: string;
  amount: string;
  status: "Completed" | "Pending";
  bankAccount: string;
};

export type TransactionRow = {
  id: string;
  date: string;
  isoDate: string;
  type: string;
  subLabel: string;
  client: string;
  amount: string;
  fee: string;
  net: string;
  status: string;
  statusDetail: string;
};

export type TransactionFilterOption = {
  label: string;
  value: string;
  kind: "filter" | "action";
};

export const transactionFilters: TransactionFilterOption[] = [
  { label: "All", value: "all", kind: "filter" },
  { label: "Deposits", value: "deposit", kind: "filter" },
  { label: "Payout", value: "payout", kind: "filter" },
  { label: "Refund", value: "refund", kind: "filter" },
  { label: "Commissions", value: "commissions", kind: "filter" },
  { label: "Date Range", value: "date-range", kind: "action" },
];

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Total Revenue",
    value: "£13,382",
    change: "+14.3% vs last month",
    icon: Wallet2,
  },
  {
    label: "Expected Payout",
    value: "£13,382",
    change: "Due on Oct 25, 2025",
    icon: CalendarClock,
  },
  {
    label: "Available Payout",
    value: "£13,382",
    change: "+14.3% vs last month",
    icon: ShieldCheck,
  },
  {
    label: "Pending Payment",
    value: "£13,382",
    change: "+14.3% vs last month",
    icon: Hourglass,
  },
];

export const bankAccountDetails: BankAccountDetails = {
  account: "••••1234",
  bank: "HSBC UK",
  owner: "Michael Chen",
  lastPayout: "Oct 21, 2024",
};

export const earningsBreakdown: EarningsBreakdownItem[] = [
  { label: "Gross Revenue", value: "£1,200", tone: "neutral" },
  { label: "Platform Fee", value: "£892", tone: "negative" },
  { label: "VAT", value: "£1,784", tone: "negative" },
  { label: "Expenses", value: "£0", tone: "neutral" },
  { label: "Net Earnings", value: "£6,244", tone: "positive", highlight: true },
];

export const upcomingPayouts: UpcomingPayout[] = [
  { label: "Sarah Johnson Wedding", date: "Oct 28", amount: "£1,200" },
  { label: "James Wilson Corporate", date: "Oct 27", amount: "£1,200" },
  { label: "Tech Startup Product", date: "Oct 26", amount: "£1,200" },
  { label: "Maria Garcia Engagement", date: "Oct 25", amount: "£1,200" },
];

export const payoutHistory: PayoutHistoryRow[] = [
  {
    date: "Oct 25, 2025",
    payoutId: "P-1024",
    amount: "£3,842",
    status: "Completed",
    bankAccount: "******1234",
  },
  {
    date: "Oct 25, 2025",
    payoutId: "P-1025",
    amount: "£3,842",
    status: "Completed",
    bankAccount: "******1234",
  },
  {
    date: "Oct 25, 2025",
    payoutId: "P-1026",
    amount: "£3,842",
    status: "Completed",
    bankAccount: "******1234",
  },
  {
    date: "Oct 25, 2025",
    payoutId: "P-1029",
    amount: "£3,842",
    status: "Completed",
    bankAccount: "******1234",
  },
];

export const transactions: TransactionRow[] = [
  {
    id: "txn-001",
    date: "Oct 25, 2025",
    isoDate: "2025-10-25",
    type: "Deposit",
    subLabel: "Commission · Your share",
    client: "Tech Startup (B-9009)",
    amount: "£1,200",
    fee: "-£120",
    net: "£1,080",
    status: "Completed",
    statusDetail: "10% Fee · In escrow",
  },
  {
    id: "txn-002",
    date: "Oct 24, 2025",
    isoDate: "2025-10-24",
    type: "Payout",
    subLabel: "Released to account",
    client: "Sarah Johnson Wedding",
    amount: "£3,842",
    fee: "-£0",
    net: "£3,842",
    status: "Completed",
    statusDetail: "Cleared",
  },
  {
    id: "txn-003",
    date: "Oct 23, 2025",
    isoDate: "2025-10-23",
    type: "Refund",
    subLabel: "Client initiated",
    client: "James Wilson Corporate",
    amount: "-£650",
    fee: "-£0",
    net: "-£650",
    status: "Pending",
    statusDetail: "Processing",
  },
  {
    id: "txn-004",
    date: "Oct 22, 2025",
    isoDate: "2025-10-22",
    type: "Deposit",
    subLabel: "Commission · Your share",
    client: "Maria Garcia Engagement",
    amount: "£900",
    fee: "-£90",
    net: "£810",
    status: "Completed",
    statusDetail: "10% Fee · In escrow",
  },
  {
    id: "txn-005",
    date: "Oct 21, 2025",
    isoDate: "2025-10-21",
    type: "Commissions",
    subLabel: "Partner referral",
    client: "Glow Studios",
    amount: "£420",
    fee: "-£0",
    net: "£420",
    status: "Completed",
    statusDetail: "Released",
  },
  {
    id: "txn-006",
    date: "Oct 20, 2025",
    isoDate: "2025-10-20",
    type: "Deposit",
    subLabel: "Commission · Your share",
    client: "Tech Startup (B-9009)",
    amount: "£1,200",
    fee: "-£120",
    net: "£1,080",
    status: "Completed",
    statusDetail: "10% Fee · In escrow",
  },
];

export const transactionMeta = {
  summary: "47 Transaction + £89,200 Total",
  paginationLabel: "Showing 3 out of 12 results",
};
