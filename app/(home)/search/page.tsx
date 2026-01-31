"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Home } from "lucide-react";
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
import {
  useVendorSearch,
  useNearbyVendors,
  useCurrentLocation,
} from "./_data/hooks";
import { useVendorSpecialties } from "@/lib/react-query/hooks/use-vendor-specialties";
import { Vendor } from "./_data/types";

const ITEMS_PER_PAGE = 10;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL parameters
  const queryParam = searchParams.get("q") || "";
  const locationParam = searchParams.get("location") || "East London";
  const categoryParam = searchParams.get("category") || "";
  const specialtyParam = searchParams.get("specialty") || "";
  const sortParam = searchParams.get("sort") || "recommendation";
  const pageParam = Number(searchParams.get("page")) || 1;

  // State for geolocation
  const {
    lat,
    long,
    error: geoError,
    loading: geoLoading,
    requestLocation,
  } = useCurrentLocation();

  // Determine which API to use
  const isNearby = sortParam === "distance"; // "Nearest"

  // Trigger geolocation if "Nearest" is selected
  useEffect(() => {
    if (isNearby && !lat && !geoLoading && !geoError) {
      requestLocation();
    }
  }, [isNearby, lat, geoLoading, geoError, requestLocation]);

  // Hook 1: Standard Search
  const searchResult = useVendorSearch({
    q: queryParam,
    service: categoryParam,
    specialty: specialtyParam,
    sort: sortParam,
    page: pageParam,
    limit: ITEMS_PER_PAGE,
  });

  // Hook 2: Nearby Search
  const nearbyResult = useNearbyVendors(lat, long, {
    q: queryParam,
    service: categoryParam,
    specialty: specialtyParam,
    page: pageParam,
    limit: ITEMS_PER_PAGE,
  });

  // Hook 3: Debug support for Vendor Specialties
  const { data: specialtiesData } = useVendorSpecialties({
    page: 1,
    limit: 20,
  });
  console.log("Vendor Specialties Debug:", specialtiesData);

  // Decide which data to show
  const { data, isLoading, isError } = isNearby ? nearbyResult : searchResult;

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
  const displayTitle = categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : queryParam
      ? `Results for "${queryParam}"`
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
            <h1 className="text-xl sm:text-xl font-semibold">
              <span className="text-foreground">{displayTitle}</span>
              {locationParam && (
                <span className="text-muted-foreground">
                  , &nbsp;{locationParam}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              <span className="font-medium">
                {geoLoading
                  ? "Locating..."
                  : `${totalItems + promotedVendors.length} found`}
              </span>
            </p>
          </div>
        </div>

        {/* Geo Error Message */}
        {isNearby && geoError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
            Could not get your location: {geoError}. Showing standard results
            instead.
            <Button
              variant="link"
              onClick={requestLocation}
              className="text-red-700 underline h-auto p-0 ml-2"
            >
              Retry
            </Button>
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
              vendors.map((vendor) => (
                <VendorListCard key={vendor._id} vendor={vendor} />
              ))
            ) : (
              // Empty State
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isNearby && geoLoading
                    ? "Getting your location..."
                    : `No vendors found for "${queryParam}"`}
                </p>
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
