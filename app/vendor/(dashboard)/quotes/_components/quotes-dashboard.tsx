"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { 
  Loader2, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { fetchVendorQuotes, withdrawQuote } from "@/lib/actions/quotes";
import { queryKeys } from "@/lib/react-query/keys";
import type { VendorQuoteResponse, VendorQuoteFilters, QuoteStatus } from "@/types/quote";
import { CreateQuoteModal } from "../../requests/_components/create-quote-modal";
import { ViewQuoteModal } from "./view-quote-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type StatusFilterValue = QuoteStatus | "all";

const STATUS_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Revised", value: "revised" },
  { label: "Expired", value: "expired" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Converted", value: "converted" },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", label: "Sent" },
  accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
  declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  changes_requested: { bg: "bg-amber-50", text: "text-amber-700", label: "Changes Requested" },
  revised: { bg: "bg-blue-50", text: "text-blue-700", label: "Revised" },
  expired: { bg: "bg-red-50", text: "text-red-700", label: "Expired" },
  withdrawn: { bg: "bg-gray-100", text: "text-gray-500", label: "Withdrawn" },
  converted: { bg: "bg-green-100", text: "text-green-800", label: "Converted" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatGBP = (val: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);

function formatRelativeExpiry(dateString?: string) {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  
  if (expiry < now) return "Expired";
  
  const diffHours = differenceInHours(expiry, now);
  if (diffHours < 24) {
    if (diffHours === 0) return "Expires in < 1 hour";
    return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }
  
  const diffDays = differenceInDays(expiry, now);
  if (diffDays === 1) return "Expires tomorrow";
  return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

// ─── Quote Card Component ───────────────────────────────────────────────────

interface QuoteCardProps {
  quote: VendorQuoteResponse;
  onEditDraft: (quote: VendorQuoteResponse) => void;
  onViewDetails: (quote: VendorQuoteResponse) => void;
  onWithdraw: (quoteId: string) => void;
  onRevise: (quote: VendorQuoteResponse) => void;
}

function QuoteCard({ quote, onEditDraft, onViewDetails, onWithdraw, onRevise }: QuoteCardProps) {
  const customerReq = quote.quoteRequestId?.customerRequestId;
  const event = customerReq?.eventDetails;
  const statusDef = statusStyles[quote.status] ?? statusStyles.draft;
  
  const customerName = [quote.customerId?.firstName, quote.customerId?.lastName]
    .filter(Boolean)
    .join(" ") || quote.customerId?.email;
    
  // Check if it's urgent (expires in < 24 hours)
  const isUrgent =
    quote.expiresAt &&
    new Date(quote.expiresAt) > new Date() &&
    differenceInHours(new Date(quote.expiresAt), new Date()) < 24;
    
  const isExpired = quote.expiresAt && new Date(quote.expiresAt) <= new Date();

  return (
    <Card className="overflow-hidden rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: Customer & Status */}
      <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {customerName}
            </h3>
            <p className="mt-1 text-[13px] text-gray-500">
              Submitted: {format(new Date(quote.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {isUrgent && !isExpired && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-red-600">
                <Clock className="size-3" />
                Urgent!
              </span>
            )}
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
                statusDef.bg,
                statusDef.text
              )}
            >
              {statusDef.label}
            </span>
          </div>
          
          {quote.expiresAt && !isExpired && (
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
              <Clock className="size-3.5" />
              <span>{formatRelativeExpiry(quote.expiresAt)}</span>
            </div>
          )}
          {isExpired && (
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-red-600">
              <Clock className="size-3.5" />
              <span>Expired</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Col: Event Details */}
        <div className="rounded-xl border border-gray-100 p-4">
          <h4 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
            Event Details
          </h4>
          <div className="space-y-4">
            {event?.title && (
              <div>
                <span className="text-[12px] font-medium text-gray-500">Title</span>
                <p className="text-[14px] font-medium text-gray-900">{event.title}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {event?.startDate && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <CalendarDays className="size-3.5" />
                    <span className="text-[12px] font-medium">Date</span>
                  </div>
                  <p className="text-[14px] font-medium text-gray-900">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {event?.guestCount && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="size-3.5" />
                    <span className="text-[12px] font-medium">Guests</span>
                  </div>
                  <p className="text-[14px] font-medium text-gray-900">
                    {event.guestCount}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quote Breakdown */}
        <div className="rounded-xl bg-[#F8F9FA] p-4 text-sm">
          <h4 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
            Quote Financials
          </h4>
          
          <div className="space-y-2 mb-4">
            {quote.lineItems?.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-gray-600">
                <span className="truncate pr-4">
                  {item.quantity}x {item.service}
                </span>
                <span className="font-medium shrink-0">{formatGBP(item.subtotal)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-3">
             <div className="flex justify-between items-end">
               <div>
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-widest">
                    Total Quoted
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-gray-900">
                    {formatGBP(quote.total)}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[12px] font-medium text-gray-500">
                    Deposit: {quote.paymentTerms?.depositPercent}%
                  </p>
                  <p className="text-[12px] font-medium text-gray-500">
                    Balance: {quote.paymentTerms?.balancePercent}%
                  </p>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {quote.status === "draft" && (
          <Button
            onClick={() => onEditDraft(quote)}
           variant={"secondary"}
          >
            Edit Draft
          </Button>
        )}
        {(quote.status === "sent" || quote.status === "changes_requested") && (
          <Button
            onClick={() => onRevise(quote)}
          
          >
            Revise Quote
          </Button>
        )}
        {quote.status === "sent" && (
          <Button
            variant="destructive"
            onClick={() => onWithdraw(quote._id)}
          >
            Withdraw
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onViewDetails(quote)}
        >
          View Full Details
        </Button>
      </div>
    </Card>
  );
}

// ─── Main List Component ────────────────────────────────────────────────────

export function QuotesDashboard() {
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [appliedFilters, setAppliedFilters] = useState<VendorQuoteFilters>({});
  const [selectedDraft, setSelectedDraft] = useState<VendorQuoteResponse | null>(null);
  const [selectedViewQuote, setSelectedViewQuote] = useState<VendorQuoteResponse | null>(null);
  const [selectedRevisionQuote, setSelectedRevisionQuote] = useState<VendorQuoteResponse | null>(null);
  
  const [withdrawQuoteId, setWithdrawQuoteId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const queryClient = useQueryClient();

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...(statusFilter !== "all" && { status: statusFilter as QuoteStatus }),
      ...(requestIdFilter && { quoteRequestId: requestIdFilter }),
    });
    setPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.quotes.vendorList(page, PAGE_SIZE, appliedFilters as Record<string, unknown>),
    queryFn: async () => {
      const result = await fetchVendorQuotes(page, PAGE_SIZE, appliedFilters);
      if (!result.success) throw new Error(result.error ?? "Failed to fetch quotes");
      return result.data!;
    },
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const quotes = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleWithdraw = async () => {
    if (!withdrawQuoteId) return;
    setIsWithdrawing(true);
    try {
      const res = await withdrawQuote(withdrawQuoteId);
      if (!res.success) {
        toast.error(res.error || "Failed to withdraw quote");
        return;
      }
      toast.success("Quote withdrawn successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      setWithdrawQuoteId(null);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <section className="space-y-6 pb-20">
      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-[20px] bg-white p-3 shadow-sm md:flex-row">
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          {/* Req ID Search */}
          <div className="relative w-full md:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Filter by Request ID..."
              value={requestIdFilter}
              onChange={(e) => setRequestIdFilter(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleApplyFilters(); }}
              className="h-[42px] w-full rounded-full border border-gray-200 bg-[#FAFAFA] pl-10 pr-4 text-[13.5px] shadow-none focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>

          {/* Status Select */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
          >
            <SelectTrigger className="h-[42px] w-full md:w-[180px] rounded-full border-gray-200 bg-[#FAFAFA] text-[13.5px] shadow-none">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13.5px] py-2">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters Button */}
        <Button
          onClick={() => startTransition(() => handleApplyFilters())}
          disabled={isFetching && !isLoading}
          className="h-[42px] w-full rounded-full bg-gray-900 px-6 text-[13.5px] font-medium text-white hover:bg-black md:w-auto shadow-none"
        >
          {isFetching && !isLoading && <Loader2 className="mr-2 size-4 animate-spin text-gray-400" />}
          Apply Filters
        </Button>
      </div>

      {/* ── Content Area ─────────────────────────────────────── */}
      <div className="space-y-4">
        {isError ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600">
              {error instanceof Error ? error.message : "Error loading quotes"}
            </p>
          </Card>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[140px]" />
                </div>
              </div>
            </Card>
          ))
        ) : quotes.length === 0 ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Search className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No quotes found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters or search criteria.
            </p>
          </Card>
        ) : (
          quotes.map((quote) => (
            <QuoteCard 
              key={quote._id} 
              quote={quote} 
              onEditDraft={setSelectedDraft} 
              onViewDetails={setSelectedViewQuote}
              onWithdraw={setWithdrawQuoteId} 
              onRevise={setSelectedRevisionQuote}
            />
          ))
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 w-9 rounded-full shadow-none border-gray-200 hover:bg-gray-50"
            >
              <ChevronLeft className="size-4 text-gray-500" />
            </Button>
            <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-gray-100 px-3 text-[13px] font-semibold text-gray-700">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 w-9 rounded-full shadow-none border-gray-200 hover:bg-gray-50"
            >
              <ChevronRight className="size-4 text-gray-500" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      <CreateQuoteModal 
        open={!!selectedDraft || !!selectedRevisionQuote} 
        onOpenChange={(open: boolean) => {
          if (!open) {
            setSelectedDraft(null);
            setSelectedRevisionQuote(null);
          }
        }} 
        draftQuote={selectedDraft || selectedRevisionQuote} 
        isRevision={!!selectedRevisionQuote}
      />
      
      <ViewQuoteModal
        open={!!selectedViewQuote}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedViewQuote(null);
        }}
        quote={selectedViewQuote}
      />

      <AlertDialog open={!!withdrawQuoteId} onOpenChange={(open) => !open && setWithdrawQuoteId(null)}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently retract the quote. The customer will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing} className="rounded-full shadow-none font-medium hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleWithdraw(); }}
              disabled={isWithdrawing}
              className="rounded-full bg-red-600 font-medium hover:bg-red-700 shadow-none text-white"
            >
              {isWithdrawing && <Loader2 className="mr-2 size-4 animate-spin text-white" />}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
