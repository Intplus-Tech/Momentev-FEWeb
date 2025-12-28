"use client";

import { useMemo, useState } from "react";

import type { QuoteRequest } from "../data";

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
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronDown, MapPin, Search, Users } from "lucide-react";

const PAGE_SIZE = 3;

const filterOptions = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Responded", value: "responded" },
  { label: "Expiring", value: "expiring" },
  { label: "Accepted", value: "accepted" },
  { label: "Decline", value: "decline" },
] as const;

type FilterValue = (typeof filterOptions)[number]["value"];

const sortOptions = [
  { label: "Newest First", value: "received-new" },
  { label: "Highest Budget", value: "budget-high" },
  { label: "Closest Date", value: "event-soon" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const helperToneClasses = {
  danger: "text-red-500",
  warning: "text-amber-500",
  muted: "text-muted-foreground",
} as const;

const stageStyles: Record<
  QuoteRequest["status"],
  { label: string; className: string }
> = {
  new: {
    label: "NEW",
    className: "border border-[#cfd8ff] bg-[#eef2ff] text-[#2F6BFF]",
  },
  "in-progress": {
    label: "IN PROGRESS",
    className: "border border-sky-200 bg-sky-50 text-sky-600",
  },
  awaiting: {
    label: "AWAITING CLIENT",
    className: "border border-amber-200 bg-amber-50 text-amber-600",
  },
  responded: {
    label: "RESPONDED",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-600",
  },
};

const actionToneClasses = {
  primary: "bg-[#2F6BFF] text-white hover:bg-[#1e4dcc]",
  primaryOutline:
    "border border-[#2F6BFF] text-[#2F6BFF] bg-white hover:bg-[#eaf0ff]",
  secondary: "border border-border bg-white text-foreground hover:bg-muted",
  danger: "border border-red-200 text-red-500 hover:bg-red-50",
} as const;

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatRelativeLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

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

const parseBudgetRange = (range: string) => {
  const matches = range.match(/\d[\d,]*/g);
  if (!matches || matches.length === 0) return 0;
  const upper = matches[matches.length - 1];
  return Number(upper.replace(/,/g, ""));
};

export function RequestsDashboard({ requests }: { requests: QuoteRequest[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("received-new");
  const [page, setPage] = useState(1);

  const { pageItems, totalPages, range, total } = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    const matchesQuery = (request: QuoteRequest) => {
      if (!normalizedQuery) return true;
      return (
        request.company.toLowerCase().includes(normalizedQuery) ||
        request.eventName.toLowerCase().includes(normalizedQuery)
      );
    };

    const matchesFilter = (request: QuoteRequest) => {
      switch (filter) {
        case "new":
          return request.status === "new";
        case "responded":
          return request.status === "responded";
        case "expiring":
          return Boolean(request.urgent);
        case "accepted":
          return Boolean(request.accepted);
        case "decline":
          return Boolean(request.declined);
        default:
          return true;
      }
    };

    const filtered = requests.filter(
      (request) => matchesQuery(request) && matchesFilter(request)
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "received-new") {
        return (
          new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        );
      }
      if (sort === "budget-high") {
        return (
          parseBudgetRange(b.budgetRange) - parseBudgetRange(a.budgetRange)
        );
      }
      if (sort === "event-soon") {
        return (
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
      }
      return (
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const hasResults = sorted.length > 0;

    return {
      total: sorted.length,
      totalPages,
      range: {
        start: hasResults ? start + 1 : 0,
        end: hasResults ? Math.min(end, sorted.length) : 0,
      },
      pageItems: sorted.slice(start, end),
    };
  }, [filter, page, query, requests, sort]);

  const activeCount = requests.length;
  const immediateCount = requests.filter((request) => request.urgent).length;

  const paginationSlots = buildPagination(page, totalPages);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">
          Quote Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeCount} Active • {immediateCount} Require Immediate Response
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="">
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 rounded-md p-0 shadow-lg"
            >
              <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quote Filter
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => {
                    setFilter(option.value);
                    setPage(1);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm text-foreground",
                    option.value === filter && "bg-muted/60 font-semibold"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Sort By
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-2xl p-0 shadow-lg"
            >
              <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quote Sort By
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => {
                    setSort(option.value);
                    setPage(1);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm text-foreground",
                    option.value === sort && "bg-muted/60 font-semibold"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name"
              className="w-full border border-transparent bg-[#f5f7fb] pl-10 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
            />
          </div>
          <Button size={"icon"}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {pageItems.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-base font-medium text-foreground">
              No requests match your filters.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting the filters or search keyword.
            </p>
          </Card>
        ) : (
          pageItems.map((request) => (
            <Card
              key={request.id}
              className="rounded-3xl border border-border p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {request.urgent && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                      Urgent
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      stageStyles[request.status].className
                    )}
                  >
                    {stageStyles[request.status].label}
                  </span>
                  {request.responseLabel && (
                    <span className="rounded-full border border-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {request.responseLabel}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    request.helperTone
                      ? helperToneClasses[request.helperTone]
                      : "text-muted-foreground"
                  )}
                >
                  {request.helperText ??
                    `Received ${formatRelativeLabel(request.receivedAt)}`}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {request.company}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {formatLongDate(request.eventDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        {request.guests} guests
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-rose-500">
                      Budget {request.budgetRange}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                    “{request.note}”
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div>
                    <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
                      Event
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {request.eventName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {request.location}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Received{" "}
                    {new Intl.RelativeTimeFormat("en", {
                      numeric: "auto",
                    }).format(
                      -Math.round(
                        (Date.now() - new Date(request.receivedAt).getTime()) /
                          (1000 * 60 * 60)
                      ),
                      "hour"
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {request.actions?.map((action) => (
                  <Button
                    key={action.label}
                    variant="secondary"
                    className={cn(
                      "rounded-full px-5 text-sm font-medium shadow-none",
                      actionToneClasses[action.tone]
                    )}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-dashed border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {range.start}-{range.end} of {total} results
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
    </section>
  );
}
