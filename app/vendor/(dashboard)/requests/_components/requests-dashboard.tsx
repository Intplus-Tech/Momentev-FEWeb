"use client";

import { useState, useCallback, useTransition } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchVendorQuoteRequests } from "@/lib/actions/quote-requests";
import { fetchVendorQuotes } from "@/lib/actions/quotes";
import { queryKeys } from "@/lib/react-query/keys";
import type {
  VendorQuoteRequest,
  VendorQuoteRequestFilters,
} from "@/types/quote-request";
import type { VendorQuoteResponse } from "@/types/quote";
import { CreateQuoteModal } from "./create-quote-modal";

import { Card } from "@/components/ui/card";

import { RequestCard, RequestCardSkeleton } from "./request-card";
import { RequestsFilters, type StatusFilterValue } from "./requests-filters";
import { RequestsPagination } from "./requests-pagination";

const PAGE_SIZE = 10;

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
      let currentPage = 1;
      const all: VendorQuoteResponse[] = [];

      // Safety cap to avoid infinite loops if the API returns inconsistent totals.
      while (currentPage <= 50) {
        const result = await fetchVendorQuotes(currentPage, limit, { status: "draft" });
        if (!result.success || !result.data) return all;

        const batch = result.data.data ?? [];
        all.push(...batch);

        const totalDrafts = result.data.total ?? all.length;
        if (all.length >= totalDrafts) return all;
        if (batch.length < limit) return all;

        currentPage += 1;
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

  const handlePageChange = useCallback(
    (nextPage: number) => {
      startTransition(() => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
      });
    },
    [totalPages]
  );

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Customer Requests</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${total} Total Request${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <RequestsFilters
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        isFetching={isFetching}
        isLoading={isLoading}
        onApplyFilters={handleApplyFilters}
      />

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

      <RequestsPagination
        page={page}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={total}
        onPageChange={handlePageChange}
      />

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

