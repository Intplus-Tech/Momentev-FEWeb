"use client";

import type { QuoteRequestStatus } from "@/types/quote-request";

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
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

export type StatusFilterValue = QuoteRequestStatus | "all";

const filterOptions: { label: string; value: StatusFilterValue }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Responded", value: "responded" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
  { label: "Closed", value: "closed" },
];

interface RequestsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: StatusFilterValue;
  onStatusFilterChange: (value: StatusFilterValue) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  onApplyFilters: () => void;
}

export function RequestsFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  isFetching,
  isLoading,
  onApplyFilters,
}: RequestsFiltersProps) {
  const hasDateFilter = Boolean(dateFrom || dateTo);

  const activeFilterLabel =
    filterOptions.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="">
              {activeFilterLabel}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 rounded-md p-0 shadow-lg"
          >
            <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status Filter
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {
                  onStatusFilterChange(option.value);
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
            onChange={(e) => onDateFromChange(e.target.value)}
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
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-44 border border-transparent bg-[#f5f7fb] pl-9 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
            title="Date To"
          />
        </div>
        {hasDateFilter && (
          <button
            type="button"
            onClick={() => {
              onDateFromChange("");
              onDateToChange("");
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
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplyFilters();
            }}
            placeholder="Search by name, event or location"
            className="w-full border border-transparent bg-[#f5f7fb] pl-10 text-sm text-foreground shadow-inner focus:border-[#5565ff] focus:bg-white"
          />
        </div>
        <Button
          onClick={onApplyFilters}
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
  );
}
