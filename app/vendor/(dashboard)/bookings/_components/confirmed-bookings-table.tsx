"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { BookingResponse, BookingStatus, PopulatedCustomer } from "@/types/booking";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Search, MoreHorizontal, Loader2, ChevronDown } from "lucide-react";
import { decideVendorBooking } from "@/lib/actions/booking";
import { PermissionActionGate } from "@/components/auth/permission-gate";
import formatMoney from "@/lib/formatMoney";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";
import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 5;

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: {
    label: "Pending Vendor Confirmation",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  paid: {
    label: "Paid",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  booked: {
    label: "Booked",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  completed: {
    label: "Completed",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

const filterOptions = [
  { label: "Pending Vendor Confirmation", value: "pending" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Paid", value: "paid" },
  { label: "Booked", value: "booked" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
] as const;

type FilterValue = BookingStatus | "all";

function getClientName(booking: BookingResponse): string {
  const customer = booking.customerId;
  if (typeof customer === "string") return customer;
  const c = customer as PopulatedCustomer;
  return `${c.firstName} ${c.lastName}`.trim();
}

function formatAmount(booking: BookingResponse): string {
  const amount = booking.amounts.total > 0
    ? booking.amounts.total
    : booking.budgetAllocations.reduce((s, a) => s + a.budgetedAmount, 0);
  return formatMoney(amount, booking.currency || "GBP");
}


export function ConfirmedBookingsTable({
  bookings,
}: {
  bookings: BookingResponse[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterValue>("all");

  const data = useMemo(() => {
    const filteredByQuery = bookings.filter((booking) => {
      const client = getClientName(booking).toLowerCase();
      const title = booking.eventDetails.title.toLowerCase();
      const id = booking._id.toLowerCase();
      return (
        client.includes(query.toLowerCase()) ||
        title.includes(query.toLowerCase()) ||
        id.includes(query.toLowerCase())
      );
    });

    const filtered = filteredByQuery.filter((booking) => {
      if (filter === "all") return true;
      return booking.status === filter;
    });

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      filtered,
      pageItems: filtered.slice(start, end),
      totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
      range: { start: start + 1, end: Math.min(end, filtered.length) },
    };
  }, [bookings, filter, page, query]);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "paid").length;
  const pendingCount = bookings.filter(
    (b) => b.status === "pending"
  ).length;


  return (
    <Card className="border border-border p-6">
      <CardHeader className="gap-2 p-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">All Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">
              {confirmedCount} Confirmed · {pendingCount} Pending
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full min-w-0 sm:w-64">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client or event"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full border-border bg-muted/40 pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="px-5 shadow-none">
                  {filter === "all"
                    ? "Filter by Status"
                    : statusConfig[filter as BookingStatus]?.label}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => {
                    setFilter("all");
                    setPage(1);
                  }}
                >
                  All Bookings
                </DropdownMenuItem>
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => {
                      setFilter(option.value);
                      setPage(1);
                    }}
                    className={cn(
                      filter === option.value && "bg-muted text-foreground"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border rounded-md mt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-muted-foreground">
              <TableHead>Client</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {data.pageItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-40 text-center text-muted-foreground"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              data.pageItems.map((booking) => {
                const sc = statusConfig[booking.status] ?? statusConfig.pending;
                const startDate = format(
                  new Date(booking.eventDetails.startDate),
                  "MMM dd, yyyy"
                );
                return (
                  <TableRow
                    key={booking._id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => router.push(`/vendor/bookings/${booking._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/vendor/bookings/${booking._id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-foreground">
                      {getClientName(booking)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {booking.eventDetails.title}
                    </TableCell>
                    <TableCell className="text-foreground">{startDate}</TableCell>
                    <TableCell className="text-foreground">
                      {formatAmount(booking)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-medium text-xs", sc.color)}
                      >
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div onClick={(event) => event.stopPropagation()}>
                        <BookingActions booking={booking} router={router} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {data.filtered.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 px-4 pb-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              Showing {data.range.start}–{data.range.end} of{" "}
              {data.filtered.length} results
            </p>
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              siblingCount={1}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingActions({ booking, router }: { booking: BookingResponse, router: any }) {
  const [isPending, startTransition] = useTransition();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  const handleDecision = (decision: "confirmed" | "rejected") => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    startTransition(async () => {
      const result = await decideVendorBooking(booking._id, decision);
      if (result.success) {
        toast.success(`Booking ${decision} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${decision} booking`);
      }
    });
  };

  if (booking.status !== "paid") {
    return null;
  }

  return (
    <PermissionActionGate module="view_orders" action="write" visualIndication={false}>
      <div className="inline-flex items-center gap-2">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending || Boolean(restriction)}>
            <span className="sr-only">Open menu</span>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDecision("confirmed")} className="cursor-pointer whitespace-nowrap">
            Confirm Booking
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDecision("rejected")}
            className="text-red-600 focus:text-red-50 focus:bg-red-600 cursor-pointer whitespace-nowrap"
          >
            Reject Booking
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

        <VendorActionBlockedDialog
          open={showBlockedDialog}
          onOpenChange={setShowBlockedDialog}
          restriction={restriction}
        />
      </div>
    </PermissionActionGate>
  );
}
