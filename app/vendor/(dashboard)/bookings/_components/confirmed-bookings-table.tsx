"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

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
import { ChevronDown, Search } from "lucide-react";

const PAGE_SIZE = 5;

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
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
  { label: "Pending", value: "pending" },
  { label: "Pending Payment", value: "pending_payment" },
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
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: booking.currency || "GBP",
  }).format(amount);
}

export function ConfirmedBookingsTable({
  bookings,
}: {
  bookings: BookingResponse[];
}) {
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

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "pending_payment"
  ).length;

  const handlePageChange = (direction: "prev" | "next") => {
    setPage((current) => {
      const nextPage = direction === "prev" ? current - 1 : current + 1;
      return Math.min(Math.max(nextPage, 1), data.totalPages);
    });
  };

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
              <TableHead>Booking ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pageItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
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
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{booking._id.slice(-8).toUpperCase()}
                    </TableCell>
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange("prev")}
                disabled={page === 1}
                className={cn(
                  "text-primary",
                  page === 1 && "pointer-events-none opacity-40"
                )}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => handlePageChange("next")}
                disabled={page === data.totalPages}
                className={cn(
                  "text-primary",
                  page === data.totalPages && "pointer-events-none opacity-40"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
