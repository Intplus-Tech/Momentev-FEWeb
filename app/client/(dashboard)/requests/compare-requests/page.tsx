"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Users, CalendarDays, MessageCircle, Search } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format, differenceInHours, differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useCustomerRequestQuotes, useCustomerRequest } from "@/hooks/api/use-custom-requests";
import { useVendorDetails } from "@/hooks/api/use-vendors";
import type { CustomerQuote, QuoteDecision } from "@/types/quote";

// Re-use the same modals from the quotes feature
import { ViewQuoteModal } from "../quotes/_components/view-quote-modal";
import { RespondQuoteModal } from "../quotes/_components/respond-quote-modal";
import { ConvertQuoteModal } from "../quotes/_components/convert-quote-modal";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusStyles: Record<string, { label: string; className: string }> = {
  sent: {
    label: "RECEIVED",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  accepted: {
    label: "ACCEPTED",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  declined: {
    label: "DECLINED",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  changes_requested: {
    label: "CHANGES REQ",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  revised: {
    label: "REVISED",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  expired: {
    label: "EXPIRED",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  withdrawn: {
    label: "WITHDRAWN",
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
  converted: {
    label: "BOOKED",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

const formatCurrency = (val: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(val);

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

// ─── Quote Card ─────────────────────────────────────────────────────────────

interface QuoteCardProps {
  quote: CustomerQuote;
  onViewDetails: () => void;
  onRespond: (decision: QuoteDecision) => void;
  onBook: () => void;
}

function QuoteCard({ quote, onViewDetails, onRespond, onBook }: QuoteCardProps) {
  const cr = quote.quoteRequestId.customerRequestId;
  const event = cr?.eventDetails;
  const statusDef = statusStyles[quote.status] ?? {
    label: quote.status.toUpperCase(),
    className: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  const isExpired = quote.expiresAt && new Date(quote.expiresAt) <= new Date();
  const isUrgent =
    quote.expiresAt &&
    new Date(quote.expiresAt) > new Date() &&
    differenceInHours(new Date(quote.expiresAt), new Date()) < 48;

  const receivedLabel = format(new Date(quote.createdAt), "MMM d, yyyy");
  const expiryLabel = quote.expiresAt
    ? formatRelativeExpiry(quote.expiresAt)
    : "No expiry";
  const expiryExact = quote.expiresAt
    ? format(new Date(quote.expiresAt), "MMM d, yyyy h:mm a")
    : null;

  const { data: vendorRes, isLoading: isLoadingVendor } = useVendorDetails(
    quote.vendorId?._id ?? null,
  );
  const vendor = vendorRes?.data;

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-card via-card/80 to-muted/40 shadow-sm">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Quote Total
            </span>
            <h3 className="text-2xl font-semibold text-foreground">
              {formatCurrency(quote.total, quote.currency)}
            </h3>
            <div className="text-sm text-muted-foreground">
              From{" "}
              {isLoadingVendor ? (
                <Skeleton className="inline-block h-4 w-24" />
              ) : (
                (vendor?.businessProfile?.businessName ??
                `Vendor #${quote.vendorId?._id?.slice(-6)}`)
              )}
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {isUrgent && !isExpired && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-700">
                Expiring Soon
              </span>
            )}
            {isExpired && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-700">
                Expired
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                statusDef.className,
              )}
            >
              {statusDef.label}
            </span>
            {cr?.serviceCategoryId?.name && (
              <span className="rounded-full border px-3 py-1 text-[11px] font-medium text-muted-foreground capitalize">
                {cr.serviceCategoryId.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Received {receivedLabel}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1",
              isExpired
                ? "bg-red-50 text-red-700 border border-red-200"
                : isUrgent
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-muted text-muted-foreground",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {expiryLabel}
          </span>
          {event?.guestCount != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Users className="h-3.5 w-3.5" />
              {event.guestCount} guests
            </span>
          )}
        </div>

        <div className="h-px w-full bg-border/70" />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-foreground">
                Event: {event?.title ?? "—"}
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {event?.startDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                    {event.endDate &&
                      ` – ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                  </span>
                )}
                {event?.guestCount != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.guestCount} guests
                  </span>
                )}
              </div>
            </div>

            {quote.personalMessage && (
              <div className="flex gap-3 rounded-xl bg-primary/5 p-3 text-sm text-foreground">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed">"{quote.personalMessage}"</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border bg-card/70 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Validity
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock
                  className={cn(
                    "h-4 w-4",
                    isExpired
                      ? "text-red-500"
                      : isUrgent
                        ? "text-amber-600"
                        : "text-muted-foreground",
                  )}
                />
                {expiryLabel}
              </p>
              {expiryExact && (
                <p className="text-xs text-muted-foreground">
                  Until {expiryExact}
                </p>
              )}
            </div>

            <div className="rounded-xl border bg-card/70 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Payment Terms
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {quote.paymentTerms.depositPercent}% Deposit
              </p>
              <p className="text-xs text-muted-foreground">
                {quote.paymentTerms.balancePercent}% Balance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onViewDetails}>
            View Full Details
          </Button>
          {quote.status === "sent" && (
            <>
              <Button variant="default" onClick={onBook}>
                Accept & Book
              </Button>
              <Button
                variant="secondary"
                onClick={() => onRespond("request_changes")}
              >
                Request Changes
              </Button>
              <Button
                variant="destructive"
                onClick={() => onRespond("decline")}
              >
                Decline
              </Button>
            </>
          )}
          {quote.status === "accepted" && (
            <Button variant="default" onClick={onBook}>
              Book Vendor
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Page Content ───────────────────────────────────────────────────────────

function CompareRequestsContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const { data: requestData, isLoading: isLoadingRequest } = useCustomerRequest(requestId);
  const { data: quotesData, isLoading: isLoadingQuotes, isError } = useCustomerRequestQuotes(requestId || "");

  const request = requestData;
  const quotes: CustomerQuote[] = quotesData?.data || [];
  const isLoading = isLoadingRequest || isLoadingQuotes;

  // Modal state — same pattern as the quotes dashboard
  const [selectedQuote, setSelectedQuote] = useState<CustomerQuote | null>(null);
  const [respondModal, setRespondModal] = useState<{
    quote: CustomerQuote | null;
    decision: QuoteDecision | null;
    open: boolean;
  }>({ quote: null, decision: null, open: false });
  const [convertModal, setConvertModal] = useState<{
    quote: CustomerQuote | null;
    open: boolean;
  }>({ quote: null, open: false });

  if (!requestId) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        No request ID provided.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        href="/client/requests"
        className="flex w-fit items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quotes for Request
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          {isLoading ? <Skeleton className="h-9 w-64" /> : request?.eventDetails?.title || "Event Request"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Review pricing, experience, and included extras to pick the vendor
          that best matches your event.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[140px]" />
                </div>
              </div>
            </Card>
          ))
        ) : isError ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-red-100 bg-red-50/50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">
              Failed to load quotes for this request
            </p>
          </Card>
        ) : quotes.length === 0 ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl p-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No quotes received yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back later when vendors respond to your request.
            </p>
          </Card>
        ) : (
          quotes.map((quote) => (
            <QuoteCard
              key={quote._id}
              quote={quote}
              onViewDetails={() => setSelectedQuote(quote)}
              onRespond={(decision) =>
                setRespondModal({ quote, decision, open: true })
              }
              onBook={() => setConvertModal({ quote, open: true })}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <ViewQuoteModal
        open={!!selectedQuote}
        onOpenChange={(open: boolean) => !open && setSelectedQuote(null)}
        quote={selectedQuote}
        onRespond={(decision) => setRespondModal({ quote: selectedQuote, decision, open: true })}
        onBook={() => setConvertModal({ quote: selectedQuote, open: true })}
      />

      <RespondQuoteModal
        quote={respondModal.quote}
        decision={respondModal.decision}
        open={respondModal.open}
        onOpenChange={(open: boolean) => setRespondModal((prev) => ({ ...prev, open }))}
      />

      <ConvertQuoteModal
        quote={convertModal.quote}
        open={convertModal.open}
        onOpenChange={(open: boolean) => setConvertModal((prev) => ({ ...prev, open }))}
      />
    </section>
  );
}

export default function CompareRequestsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">Loading quotes...</div>
    }>
      <CompareRequestsContent />
    </Suspense>
  );
}
