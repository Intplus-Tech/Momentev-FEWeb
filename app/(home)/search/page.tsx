"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Home, MapPin, AlertCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { PromotedVendorCard, VendorListCard, Pagination } from "./_components";
import { promotedVendors } from "./_data/vendors";
import { useVendors } from "@/hooks/api/use-vendors";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { Vendor } from "./_data/types";

const ITEMS_PER_PAGE = 10;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL parameters
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const specialtyParam = searchParams.get("specialty") || "";
  const sortParam = searchParams.get("sort") || "recommendation";
  const pageParam = Number(searchParams.get("page")) || 1;

  // Geolocation params from URL (set by HomeHeader)
  const latParam = searchParams.get("lat");
  const longParam = searchParams.get("long");
  const radiusParam = searchParams.get("radius");

  const urlLat = latParam ? parseFloat(latParam) : null;
  const urlLong = longParam ? parseFloat(longParam) : null;
  const maxDistanceKm = radiusParam ? parseInt(radiusParam, 10) : 50;

  // Determine if we should use nearby search
  const hasUrlLocation = urlLat !== null && urlLong !== null;
  const isNearbySort = sortParam === "distance";

  // Fetch categories to resolve ID to Name
  const { data: categoriesData } = useServiceCategories();

  // Find category name
  const categoryName = useMemo(() => {
    if (!categoryParam || !categoriesData?.data?.data) return null;
    const category = categoriesData.data.data.find(
      (c) => c._id === categoryParam,
    );
    return category ? category.name : null;
  }, [categoryParam, categoriesData]);

  // Unified Search Hook
  const { data, isLoading, isError } = useVendors(
    {
      q: queryParam,
      service: categoryParam,
      specialty: specialtyParam,
      sort: sortParam,
      page: pageParam,
      limit: ITEMS_PER_PAGE,
    },
    hasUrlLocation
      ? {
          lat: urlLat,
          long: urlLong,
          radius: maxDistanceKm,
        }
      : undefined,
  );

  const vendors = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Handlers
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  // Display Title
  const displayTitle = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : queryParam
      ? `Results for "${queryParam}"`
      : categoryParam
        ? "Category Found" // Fallback if name not found yet
        : "All Vendors";

  return (
    <div className="min-h-screen pt-40">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select value={sortParam} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]">
                <span className="text-muted-foreground text-sm mr-1">
                  Sort By:
                </span>
                <SelectValue placeholder="Recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommendation">Recommendation</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <h1 className="text-xl sm:text-xl flex items-center gap-2 font-semibold">
              <span className="text-foreground">{displayTitle}</span>
              {hasUrlLocation && (
                <span className="text-muted-foreground flex items-center gap-1 text-sm ml-2">
                  <MapPin className="w-4 h-4" />
                  within {maxDistanceKm} km
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              <span className="font-medium">
                {isLoading ? "Loading..." : `${totalItems} found`}
              </span>
            </p>
          </div>
        </div>

        {/* Info message when nearby sort selected but no location */}
        {isNearbySort && !hasUrlLocation && (
          <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-4 rounded-md mb-6 text-sm flex items-center gap-2">
            <MapPin className="w-5 h-5 shrink-0" />
            <span>
              Set your location using the header to see nearby results.
            </span>
          </div>
        )}

        {/* API Error Message */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Failed to load vendors. Please try refreshing the page.</span>
          </div>
        )}

        {/* Step 1: Promoted Vendors Grid (Hardcoded for now) */}
        {promotedVendors.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {promotedVendors.map((vendor) => (
              <PromotedVendorCard key={vendor._id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* Step 2: Main Vendors List */}
        <div className="space-y-4">
          {
            // Loading Skeleton
            isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-muted animate-pulse rounded-xl"
                />
              ))
            ) : vendors.length > 0 ? (
              vendors.map((vendor: Vendor) => (
                <VendorListCard key={vendor._id} vendor={vendor} />
              ))
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  {`We couldn't find any vendors matching "${queryParam}". Try adjusting your search term or filters.`}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/search");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )
          }
        </div>

        {/* Pagination & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span>search</span>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={pageParam}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Page Info */}
        {!isLoading && vendors.length > 0 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing {(pageParam - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(pageParam * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
            vendors
          </div>
        )}
      </main>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen pt-40 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
