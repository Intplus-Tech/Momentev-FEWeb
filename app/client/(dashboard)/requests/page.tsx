"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCustomerRequests } from "@/hooks/api/use-custom-requests";
import { RequestCard } from "./_components/RequestCard";
import { EmptyState } from "./_components/EmptyState";
import { RequestsSkeleton } from "./_components/RequestsSkeleton";
import { RequestFilters } from "./_components/RequestFilters";
import type { CustomerRequestFilters } from "@/types/custom-request";

function ClientRequestsContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  // Initialize filters from URL
  const [filters, setFilters] = useState<CustomerRequestFilters>(() => ({
    search: searchParams.get("search") || undefined,
    status:
      (searchParams.get("status") as CustomerRequestFilters["status"]) ||
      undefined,
    serviceCategoryId: searchParams.get("serviceCategoryId") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  }));

  const { data, isLoading, isError, isFetching } = useCustomerRequests(
    page,
    limit,
    filters,
  );

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleFiltersChange = useCallback(
    (newFilters: CustomerRequestFilters) => {
      setFilters(newFilters);
    },
    [],
  );

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${total} Total Request${total !== 1 ? "s" : ""}`}
            {isFetching && !isLoading && " · Updating..."}
          </p>
        </div>
        <Button asChild>
          <Link href="/client/custom-request">Create New Request</Link>
        </Button>
      </div>

      {/* Filters */}
      <RequestFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <RequestsSkeleton />
        ) : isError ? (
          <div className="py-10 text-center text-muted-foreground">
            <p className="text-lg font-medium">Failed to load requests</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  asChild={page > 1}
                >
                  {page > 1 ? (
                    <Link
                      href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(page - 1),
                      }).toString()}`}
                    >
                      Previous
                    </Link>
                  ) : (
                    <span>Previous</span>
                  )}
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  asChild={page < totalPages}
                >
                  {page < totalPages ? (
                    <Link
                      href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(page + 1),
                      }).toString()}`}
                    >
                      Next
                    </Link>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : hasActiveFilters ? (
          <div className="py-16 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  No matching requests
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't find any requests matching your filters. Try
                  adjusting your search criteria.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  // Clear filters by navigating to page without params
                  window.location.href = "/client/requests";
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

export default function ClientRequestsPage() {
  return (
    <Suspense fallback={<RequestsSkeleton />}>
      <ClientRequestsContent />
    </Suspense>
  );
}
