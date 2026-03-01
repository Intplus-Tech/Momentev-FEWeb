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
  ChevronRight,
} from "lucide-react";

import {
  fetchCustomerQuoteRequests,
  closeQuoteRequest,
} from "@/lib/actions/client-quote-requests";
import { queryKeys } from "@/lib/react-query/keys";
import type {
  CustomerQuoteRequest,
  CustomerQuoteRequestFilters,
  QuoteRequestStatus,
} from "@/types/quote-request";

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

type StatusFilterValue = QuoteRequestStatus | "all";

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "closed", label: "Closed" },
];

const statusStyles: Record<string, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  responded: {
    label: "RESPONDED",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  accepted: {
    label: "ACCEPTED",
    className: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  completed: {
    label: "COMPLETED",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  expired: {
    label: "EXPIRED",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
  closed: {
    label: "CLOSED",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

const formatGBP = (val: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    val,
  );

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

// ─── Quote Request Card ─────────────────────────────────────────────────────

interface QuoteRequestCardProps {
  request: CustomerQuoteRequest;
  onClose: (id: string) => void;
}

function QuoteRequestCard({ request, onClose }: QuoteRequestCardProps) {
  const cr = request.customerRequestId;
  const event = cr?.eventDetails;
  const statusDef = statusStyles[request.status] ?? statusStyles.new;

  const budget = cr?.budgetAllocations?.reduce(
    (sum, b) => sum + (b.budgetedAmount ?? 0),
    0,
  );

  const isExpired =
    request.expiresAt && new Date(request.expiresAt) <= new Date();
  const isUrgent =
    request.expiresAt &&
    new Date(request.expiresAt) > new Date() &&
    differenceInHours(new Date(request.expiresAt), new Date()) < 24;

  const canClose = request.status === "new" || request.status === "responded";

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: Status & Service Category */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isUrgent && !isExpired && (
          <span className="rounded-lg bg-red-100 px-2.5 py-0.5 text-[12px] font-medium text-red-600">
            Urgent!
          </span>
        )}
        {isExpired && (
          <span className="rounded-lg bg-red-100 px-2.5 py-0.5 text-[12px] font-medium text-red-600">
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
        <span className="ml-auto text-sm text-muted-foreground">
          Sent {format(new Date(request.createdAt), "MMM d, yyyy")}
        </span>
      </div>

      {/* Body */}
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {event?.title ?? "—"}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {event?.startDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {format(new Date(event.startDate), "MMM d, yyyy")}
                  {event.endDate &&
                    ` – ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                </span>
              )}
              {event?.guestCount != null && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  {event.guestCount} guests
                </span>
              )}
              {event?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          {budget != null && budget > 0 && (
            <p className="text-sm font-medium text-primary">
              Budget: {formatGBP(budget)}
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
          <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Expiry
          </p>
          {request.expiresAt ? (
            <>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock
                  className={cn(
                    "h-4 w-4",
                    isUrgent ? "text-red-500" : "text-muted-foreground",
                  )}
                />
                {formatRelativeExpiry(request.expiresAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(request.expiresAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No expiry</p>
          )}
          {request.respondedAt && (
            <div className="pt-2 border-t">
              <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                Responded
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(
                  new Date(request.respondedAt),
                  "MMM d, yyyy 'at' h:mm a",
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {canClose && (
          <Button variant="destructive" onClick={() => onClose(request._id)}>
            Close Request
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function QuoteRequestsDashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [appliedFilters, setAppliedFilters] =
    useState<CustomerQuoteRequestFilters>({});

  const [closeRequestId, setCloseRequestId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const queryClient = useQueryClient();

  const handleApplyFilters = (newStatus: StatusFilterValue) => {
    setAppliedFilters({
      ...(newStatus !== "all" && { status: newStatus as QuoteRequestStatus }),
    });
    setPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.quoteRequests.customerList(
      page,
      PAGE_SIZE,
      appliedFilters as Record<string, unknown>,
    ),
    queryFn: async () => {
      const result = await fetchCustomerQuoteRequests(
        page,
        PAGE_SIZE,
        appliedFilters,
      );
      if (!result.success)
        throw new Error(result.error ?? "Failed to fetch quote requests");
      return result.data!;
    },
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleClose = async () => {
    if (!closeRequestId) return;
    setIsClosing(true);
    try {
      const res = await closeQuoteRequest(closeRequestId);
      if (!res.success) {
        toast.error(res.error || "Failed to close quote request");
        return;
      }
      toast.success("Quote request closed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });
      setCloseRequestId(null);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Quote Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${total} request${total !== 1 ? "s" : ""} sent to vendors`}
          {isFetching && !isLoading && " · Updating..."}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-3 shadow-sm md:flex-row">
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              const newStatus = val as StatusFilterValue;
              setStatusFilter(newStatus);
              startTransition(() => handleApplyFilters(newStatus));
            }}
          >
            <SelectTrigger className="h-10 w-full md:w-[180px] rounded-xl text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm py-2"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isError ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-red-100 bg-red-50/50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">
              {error instanceof Error
                ? error.message
                : "Error loading quote requests"}
            </p>
          </Card>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
        ) : requests.length === 0 ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl p-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No quote requests found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or create a new request to get started.
            </p>
          </Card>
        ) : (
          requests.map((request) => (
            <QuoteRequestCard
              key={request._id}
              request={request}
              onClose={setCloseRequestId}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, total)} of {total} results
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
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-muted px-3 text-sm font-semibold">
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
              className="h-9 w-9 rounded-full"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Close Confirmation */}
      <AlertDialog
        open={!!closeRequestId}
        onOpenChange={(open) => !open && setCloseRequestId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Close Quote Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently close the quote request. Vendors will no
              longer be able to respond to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClose();
              }}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClosing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Close Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
