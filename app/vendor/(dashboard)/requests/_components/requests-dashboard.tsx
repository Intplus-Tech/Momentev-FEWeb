"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchVendorQuoteRequests } from "@/lib/actions/quote-requests";
import { fetchVendorQuotes } from "@/lib/actions/quotes";
import { queryKeys } from "@/lib/react-query/keys";
import type {
  QuoteRequestStatus,
  VendorQuoteRequest,
  VendorQuoteRequestFilters,
} from "@/types/quote-request";
import type { VendorQuoteResponse } from "@/types/quote";
import { CreateQuoteModal } from "./create-quote-modal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Search,
  Users,
  Loader2,
  X,
  Clock,
} from "lucide-react";

const PAGE_SIZE = 10;

type StatusFilterValue = QuoteRequestStatus | "all";

const filterOptions: { label: string; value: StatusFilterValue }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Responded", value: "responded" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
  { label: "Closed", value: "closed" },
];

const stageStyles: Record<QuoteRequestStatus, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "border border-[#cfd8ff] bg-[#eef2ff] text-[#2F6BFF]",
  },
  responded: {
    label: "RESPONDED",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  accepted: {
    label: "ACCEPTED",
    className: "border border-sky-200 bg-sky-50 text-sky-600",
  },
  completed: {
    label: "COMPLETED",
    className: "border border-green-200 bg-green-50 text-green-700",
  },
  expired: {
    label: "EXPIRED",
    className: "border border-amber-200 bg-amber-50 text-amber-600",
  },
  closed: {
    label: "CLOSED",
    className: "border border-zinc-200 bg-zinc-50 text-zinc-500",
  },
};

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatRelativeExpiry = (expiryDateString: string) => {
  const expiry = new Date(expiryDateString).getTime();
  const now = Date.now();
  const diffMs = expiry - now;

  if (diffMs <= 0) return "Expired";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Expires in less than an hour";
  if (diffHours < 24) return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  if (diffDays === 1) return "Expires tomorrow";

  return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
};

const formatReceivedTime = (createdAtString: string) => {
  const created = new Date(createdAtString).getTime();
  const now = Date.now();
  const diffMs = now - created;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diffHours < 1) return rtf.format(-Math.round(diffMs / (1000 * 60)), "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffWeeks < 4) return rtf.format(-diffWeeks, "week");
  return rtf.format(-diffMonths, "month");
};

const buildPagination = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const valid = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result: (number | string)[] = [];
  let prev = 0;
  for (const page of valid) {
    if (prev && page - prev > 1) {
      result.push("…");
    }
    result.push(page);
    prev = page;
  }

  return result;
};

function RequestCardSkeleton() {
  return (
    <Card className="rounded-3xl border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </Card>
  );
}

interface RequestCardProps {
  request: VendorQuoteRequest;
  existingDraft?: VendorQuoteResponse | null;
  onCreateQuote: (request: VendorQuoteRequest) => void;
  onEditDraft: (draft: VendorQuoteResponse) => void;
}

function RequestCard({ request, existingDraft, onCreateQuote, onEditDraft }: RequestCardProps) {
  const cr = request.customerRequestId;
  const status = request.status;
  const style = stageStyles[status] ?? {
    label: status.toUpperCase(),
    className: "border border-gray-200 bg-gray-50 text-gray-500",
  };

  const isExpired = status === "new" && request.expiresAt && new Date(request.expiresAt).getTime() <= Date.now();
  const isExpiringSoon =
    status === "new" &&
    request.expiresAt &&
    !isExpired &&
    new Date(request.expiresAt).getTime() - Date.now() < 1000 * 60 * 60 * 24;

  const customerName =
    `${cr?.customerId?.firstName ?? ""} ${cr?.customerId?.lastName ?? ""}`.trim() ||
    request.customerId?.email;

  const budget = cr?.budgetAllocations?.reduce(
    (sum, b) => sum + (b.budgetedAmount ?? 0),
    0
  );

  return (
    <Card className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {request.expiresAt && isExpiringSoon && !isExpired && (
            <div className="flex items-center gap-2 mr-2">
              <span className="rounded-[8px] bg-[#FFDADA] px-2.5 py-0.5 text-[12px] font-medium text-[#E03131]">
                Urgent!
              </span>
              <span className="flex items-center gap-1.5 text-[13.5px] text-[#E03131] font-medium">
                <Clock className="h-4 w-4" />
                {formatRelativeExpiry(request.expiresAt)}
              </span>
            </div>
          )}
          {request.expiresAt && isExpired && (
            <span className="rounded-[8px] bg-[#FFDADA] px-2.5 py-0.5 text-[12px] font-medium text-[#E03131]">
              Expired
            </span>
          )}
          {!isExpiringSoon && !isExpired && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                style.className
              )}
            >
              {style.label}
            </span>
          )}
          {cr?.serviceCategoryId?.name && (
            <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 capitalize bg-white">
              {cr.serviceCategoryId.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Received {formatReceivedTime(request.createdAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div>
            {/* <p>{request._id}</p> */}
            <p className="text-lg font-semibold text-gray-900">{customerName}</p>
            <p className="text-sm text-gray-500">{request.customerId?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {cr?.eventDetails?.startDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[#2F6BFF]" />
                  {formatLongDate(cr.eventDetails.startDate)}
                </span>
              )}
              {cr?.eventDetails?.guestCount != null && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#2F6BFF]" />
                  {cr.eventDetails.guestCount} guests
                </span>
              )}
            </div>
            {budget != null && budget > 0 && (
              <p className="mt-2 text-[14px] font-medium text-primary">
                Budget: £{budget.toLocaleString()}
              </p>
            )}
          </div>
          {cr?.eventDetails?.description && (
            <div className="rounded-[16px] bg-[#F8F9FA] px-5 py-4 text-sm text-gray-500 leading-relaxed">
              "{cr.eventDetails.description}"
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-[16px] bg-[#F8F9FA] p-5">
          <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500">
            Event
          </p>
          <p className="text-[15px] font-semibold text-gray-900">
            {cr?.eventDetails?.title ?? "—"}
          </p>
          {cr?.eventDetails?.location && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-600">
              <MapPin className="h-4 w-4 text-[#2F6BFF]" />
              {cr.eventDetails.location}
            </div>
          )}
          {request.expiresAt && !isExpiringSoon && !isExpired && (
            <p className="mt-2 text-[13px] text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeExpiry(request.expiresAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {status !== "responded" && !isExpired && (
          <>
            {existingDraft ? (
              <>
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  ✎ Draft in progress
                </div>
                <Button
                  onClick={() => onEditDraft(existingDraft)}
                  className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] shadow-none"
                >
                  Continue Draft
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onCreateQuote(request)}
                className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] shadow-none"
              >
                Create Quote
              </Button>
            )}
          </>
        )}
        {status !== "responded" && !isExpired && (
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium border-red-100 bg-red-50 text-red-500 hover:bg-red-100 shadow-none hover:text-red-600 border-none"
          >
            Decline
          </Button>
        )}
      </div>
    </Card>
  );
}

export function RequestsDashboard() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  const [appliedFilters, setAppliedFilters] = useState<VendorQuoteRequestFilters>({});
  const [selectedRequest, setSelectedRequest] = useState<VendorQuoteRequest | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<VendorQuoteResponse | null>(null);

  const hasDateFilter = Boolean(dateFrom || dateTo);

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(query && { search: query }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    });
    setPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.quoteRequests.vendorList(page, PAGE_SIZE, appliedFilters as Record<string, unknown>),
    queryFn: async () => {
      const result = await fetchVendorQuoteRequests(page, PAGE_SIZE, appliedFilters);
      if (!result.success) throw new Error(result.error ?? "Failed to fetch");
      return result.data!;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  // Fetch all draft quotes (paged) to show on request cards.
  // Some backends enforce a max `limit`, so we avoid asking for a huge page size.
  const { data: draftQuotes = [] } = useQuery({
    queryKey: [...queryKeys.quotes.all, "draftLookup"] as const,
    queryFn: async () => {
      const limit = 50;
      let page = 1;
      const all: VendorQuoteResponse[] = [];

      // Safety cap to avoid infinite loops if the API returns inconsistent totals.
      while (page <= 50) {
        const result = await fetchVendorQuotes(page, limit, { status: "draft" });
        if (!result.success || !result.data) return all;

        const batch = result.data.data ?? [];
        all.push(...batch);

        const totalDrafts = result.data.total ?? all.length;
        if (all.length >= totalDrafts) return all;
        if (batch.length < limit) return all;

        page += 1;
      }

      return all;
    },
    staleTime: 30_000,
  });

  // Create maps for quick lookup:
  // - by vendor quote-request id (preferred)
  // - by customer request id (fallback)
  const draftsByRequestId = new Map<string, VendorQuoteResponse>();
  const draftsByCustomerRequestId = new Map<string, VendorQuoteResponse>();

  const upsertLatestDraft = (
    map: Map<string, VendorQuoteResponse>,
    key: string | undefined,
    quote: VendorQuoteResponse
  ) => {
    if (!key) return;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, quote);
      return;
    }

    const prevUpdated = new Date(prev.updatedAt).getTime();
    const nextUpdated = new Date(quote.updatedAt).getTime();
    if (nextUpdated >= prevUpdated) map.set(key, quote);
  };

  draftQuotes.forEach((quote) => {
    upsertLatestDraft(draftsByRequestId, quote.quoteRequestId?._id, quote);
    upsertLatestDraft(draftsByCustomerRequestId, quote.customerRequestId, quote);
  });

  const paginationSlots = buildPagination(page, totalPages);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      startTransition(() => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
      });
    },
    [totalPages]
  );

  const activeFilterLabel =
    filterOptions.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Quote Requests</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${total} Total Request${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="">
                {activeFilterLabel}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-md p-0 shadow-lg">
              <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status Filter
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => {
                    setStatusFilter(option.value);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm text-foreground",
                    option.value === statusFilter && "bg-muted/60 font-semibold"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-44 border border-transparent bg-[#f5f7fb] pl-9 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
              title="Date From"
            />
          </div>
          <span className="text-xs text-muted-foreground">→</span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-44 border border-transparent bg-[#f5f7fb] pl-9 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
              title="Date To"
            />
          </div>
          {hasDateFilter && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" />
              Clear dates
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyFilters();
              }}
              placeholder="Search by name, event or location"
              className="w-full border border-transparent bg-[#f5f7fb] pl-10 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
            />
          </div>
          <Button
            onClick={handleApplyFilters}
            disabled={isFetching}
            className="bg-[#2F6BFF] text-white hover:bg-[#1e4dcc]"
          >
            {isFetching && !isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <RequestCardSkeleton />
            <RequestCardSkeleton />
            <RequestCardSkeleton />
          </>
        ) : isError ? (
          <Card className="border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-base font-medium text-foreground">
              Failed to load quote requests.
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "An error occurred."}
            </p>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-base font-medium text-foreground">
              No requests match your filters.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting the status filter or search keyword.
            </p>
          </Card>
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              existingDraft={
                draftsByRequestId.get(request._id) ??
                draftsByCustomerRequestId.get(request.customerRequestId?._id)
              }
              onCreateQuote={setSelectedRequest}
              onEditDraft={setSelectedDraft}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-dashed border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {rangeStart}–{rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            className={cn(
              "rounded-full px-3 py-1 text-primary",
              page === 1 && "pointer-events-none opacity-40"
            )}
          >
            Previous
          </button>
          {paginationSlots.map((slot, index) =>
            typeof slot === "number" ? (
              <button
                key={`${slot}-${index}`}
                type="button"
                onClick={() => handlePageChange(slot)}
                className={cn(
                  "h-9 w-9 rounded-full text-sm font-medium",
                  slot === page
                    ? "bg-[#2F6BFF] text-white"
                    : "border border-border text-foreground hover:bg-muted"
                )}
              >
                {slot}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-1">
                {slot}
              </span>
            )
          )}
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            className={cn(
              "rounded-full px-3 py-1 text-primary",
              page === totalPages && "pointer-events-none opacity-40"
            )}
          >
            Next →
          </button>
        </div>
      </div>

      <CreateQuoteModal
        open={!!selectedRequest || !!selectedDraft}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setSelectedDraft(null);
          }
        }}
        request={selectedRequest}
        draftQuote={selectedDraft}
      />
    </section>
  );
}

