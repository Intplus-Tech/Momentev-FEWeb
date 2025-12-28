"use client";

import { useMemo, useState } from "react";

import type { ConfirmedBooking } from "../data";

import { Button } from "@/components/ui/button";
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
const filterOptions = [
  { label: "This Week", value: "this-week" },
  { label: "Next Week", value: "next-week" },
  { label: "This Month", value: "this-month" },
  { label: "Requiring Action", value: "action" },
] as const;

type FilterValue = (typeof filterOptions)[number]["value"] | "all";

export function ConfirmedBookingsTable({
  bookings,
}: {
  bookings: ConfirmedBooking[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterValue>("all");

  const data = useMemo(() => {
    const filteredByQuery = bookings.filter((booking) => {
      const target =
        `${booking.client} ${booking.service} ${booking.id}`.toLowerCase();
      return target.includes(query.toLowerCase());
    });

    const filtered = filteredByQuery.filter((booking) => {
      if (filter === "all") return true;
      if (filter === "action") return booking.status === "action";
      return booking.timeframe === filter;
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

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const actionCount = bookings.filter((b) => b.status === "action").length;

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
            <CardTitle className="text-xl">Confirmed Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">
              {upcomingCount} Upcoming · {actionCount} Requiring Action
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full min-w-0 sm:w-64">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full border-border bg-muted/40 pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="px-5 shadow-none">
                    {filter === "all"
                      ? "Filter"
                      : filterOptions.find((option) => option.value === filter)
                          ?.label}
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
              <Button className="whitespace-nowrap">Add Booking</Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="text-muted-foreground">
              <TableHead>Booking ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pageItems.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-foreground">
                  {booking.id}
                </TableCell>
                <TableCell className="text-foreground">
                  {booking.client}
                </TableCell>
                <TableCell className="text-foreground">
                  {booking.date}
                </TableCell>
                <TableCell className="text-foreground">
                  {booking.service}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  {booking.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Showing {data.range.start}-{data.range.end} of{" "}
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
      </CardContent>
    </Card>
  );
}
