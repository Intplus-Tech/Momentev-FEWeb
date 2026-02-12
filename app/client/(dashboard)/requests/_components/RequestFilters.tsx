"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import type {
  CustomerRequestFilters,
  CustomerRequestStatus,
} from "@/types/custom-request";
import type { ServiceCategory } from "@/types/service";

const ALL_VALUE = "__all__";

const STATUS_OPTIONS: {
  value: CustomerRequestStatus | typeof ALL_VALUE;
  label: string;
}[] = [
  { value: ALL_VALUE, label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "active", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

interface RequestFiltersProps {
  onFiltersChange: (filters: CustomerRequestFilters) => void;
  initialFilters?: CustomerRequestFilters;
}

export function RequestFilters({
  onFiltersChange,
  initialFilters = {},
}: RequestFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for filter values
  const [search, setSearch] = useState(
    initialFilters.search || searchParams.get("search") || "",
  );
  const [status, setStatus] = useState<
    CustomerRequestStatus | typeof ALL_VALUE
  >(
    (initialFilters.status || searchParams.get("status") || ALL_VALUE) as
      | CustomerRequestStatus
      | typeof ALL_VALUE,
  );
  const [categoryId, setCategoryId] = useState(
    initialFilters.serviceCategoryId ||
      searchParams.get("serviceCategoryId") ||
      ALL_VALUE,
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialFilters.dateFrom ? new Date(initialFilters.dateFrom) : undefined,
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialFilters.dateTo ? new Date(initialFilters.dateTo) : undefined,
  );

  // Debounce timer for search
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Fetch service categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } =
    useServiceCategories();

  // The response structure is ActionResponse<PaginatedResponse<ServiceCategory>>
  // useQuery unwraps the Promise, so categoriesData is PaginatedResponse<ServiceCategory>
  // PaginatedResponse has a 'data' property which contains the actual 'data' array
  const categories: ServiceCategory[] = categoriesData?.data?.data ?? [];

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    (status && status !== ALL_VALUE) ||
    (categoryId && categoryId !== ALL_VALUE) ||
    dateFrom ||
    dateTo;

  // Update URL with current filters
  const updateUrl = useCallback(
    (filters: CustomerRequestFilters) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change
      params.set("page", "1");

      if (filters.search) {
        params.set("search", filters.search);
      } else {
        params.delete("search");
      }

      if (filters.status) {
        params.set("status", filters.status);
      } else {
        params.delete("status");
      }

      if (filters.serviceCategoryId) {
        params.set("serviceCategoryId", filters.serviceCategoryId);
      } else {
        params.delete("serviceCategoryId");
      }

      if (filters.dateFrom) {
        params.set("dateFrom", filters.dateFrom);
      } else {
        params.delete("dateFrom");
      }

      if (filters.dateTo) {
        params.set("dateTo", filters.dateTo);
      } else {
        params.delete("dateTo");
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Build and emit filters
  const emitFilters = useCallback(() => {
    const filters: CustomerRequestFilters = {};

    if (search.trim()) filters.search = search.trim();
    if (status && status !== ALL_VALUE)
      filters.status = status as CustomerRequestStatus;
    if (categoryId && categoryId !== ALL_VALUE)
      filters.serviceCategoryId = categoryId;
    if (dateFrom) filters.dateFrom = dateFrom.toISOString();
    if (dateTo) filters.dateTo = dateTo.toISOString();

    updateUrl(filters);
    onFiltersChange(filters);
  }, [
    search,
    status,
    categoryId,
    dateFrom,
    dateTo,
    updateUrl,
    onFiltersChange,
  ]);

  // Debounced search handler
  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      const filters: CustomerRequestFilters = {};
      if (value.trim()) filters.search = value.trim();
      if (status && status !== ALL_VALUE)
        filters.status = status as CustomerRequestStatus;
      if (categoryId && categoryId !== ALL_VALUE)
        filters.serviceCategoryId = categoryId;
      if (dateFrom) filters.dateFrom = dateFrom.toISOString();
      if (dateTo) filters.dateTo = dateTo.toISOString();

      updateUrl(filters);
      onFiltersChange(filters);
    }, 300);

    setSearchDebounce(timeout);
  };

  // Handle select changes (immediate)
  const handleStatusChange = (value: string) => {
    const newStatus = value as CustomerRequestStatus | typeof ALL_VALUE;
    setStatus(newStatus);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
  };

  // Track if initial mount has happened — skip emitting on mount
  // because the parent already has correct initial filters from URL
  const [isMounted, setIsMounted] = useState(false);

  // Emit filters when non-search filters change (skip mount)
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    emitFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, categoryId, dateFrom, dateTo]);

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setStatus(ALL_VALUE);
    setCategoryId(ALL_VALUE);
    setDateFrom(undefined);
    setDateTo(undefined);

    const params = new URLSearchParams();
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input - Flexible width with minimum */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9 w-full"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px] lg:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={categoryId}
          onValueChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="w-[120px] lg:w-[140px]">
            <SelectValue
              placeholder={categoriesLoading ? "Loading..." : "Category"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "MMM d, yyyy") : "To Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground ml-auto lg:ml-0"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              Search: &quot;{search}&quot;
              <button
                onClick={() => handleSearchChange("")}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {status && status !== ALL_VALUE && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              Status: {STATUS_OPTIONS.find((o) => o.value === status)?.label}
              <button
                onClick={() => setStatus(ALL_VALUE)}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {categoryId && categoryId !== ALL_VALUE && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              Category:{" "}
              {categories.find((c) => c._id === categoryId)?.name || categoryId}
              <button
                onClick={() => setCategoryId(ALL_VALUE)}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              From: {format(dateFrom, "MMM d, yyyy")}
              <button
                onClick={() => setDateFrom(undefined)}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              To: {format(dateTo, "MMM d, yyyy")}
              <button
                onClick={() => setDateTo(undefined)}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
