"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PromotedVendorCard, VendorListCard, Pagination } from "./_components";
import { promotedVendors, allVendors } from "./_data/vendors";

const ITEMS_PER_PAGE = 4;

function SearchContent() {
  const searchParams = useSearchParams();

  // Read URL parameters
  const queryParam = searchParams.get("q") || "";
  const locationParam = searchParams.get("location") || "East London";
  const categoryParam = searchParams.get("category") || "";

  const [sortBy, setSortBy] = useState("recommendation");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search params change
  useEffect(() => {
    setCurrentPage(1);
  }, [queryParam, locationParam, categoryParam]);

  // Get regular vendors (excluding promoted)
  const regularVendors = useMemo(() => {
    return allVendors.filter((v) => !v.promoted);
  }, []);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    if (!queryParam) return regularVendors;

    const query = queryParam.toLowerCase();
    return regularVendors.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.address.toLowerCase().includes(query) ||
        v.services?.some((s) => s.toLowerCase().includes(query))
    );
  }, [regularVendors, queryParam]);

  // Sort vendors based on selected sort option
  const sortedVendors = useMemo(() => {
    const vendors = [...filteredVendors];
    switch (sortBy) {
      case "rating":
        return vendors.sort((a, b) => b.rating - a.rating);
      case "reviews":
        return vendors.sort((a, b) => b.reviews - a.reviews);
      case "distance":
        return vendors.sort((a, b) => {
          const distA = parseFloat(a.distance?.split(" ")[0] || "999");
          const distB = parseFloat(b.distance?.split(" ")[0] || "999");
          return distA - distB;
        });
      default:
        return vendors;
    }
  }, [filteredVendors, sortBy]);

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(sortedVendors.length / ITEMS_PER_PAGE)
  );

  // Get vendors for current page
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedVendors, currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // Reset to page 1 when sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Build display title based on search
  const displayTitle = queryParam || "Makeup Artists";

  return (
    <div className="min-h-screen pt-40">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]">
                <span className="text-muted-foreground text-sm mr-1">
                  Sort By:
                </span>
                <SelectValue placeholder="Recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommendation">Recommendation</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <h1 className="text-xl sm:text-xl font-semibold">
              <span className="text-foreground">{displayTitle},</span>{" "}
              <span className="text-muted-foreground">{locationParam}</span>
            </h1>
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Search result:{" "}
              <span className="font-medium">
                {sortedVendors.length + promotedVendors.length} found
              </span>
            </p>
          </div>
        </div>

        {/* Promoted Vendors Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {promotedVendors.map((vendor) => (
            <PromotedVendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>

        {/* Regular Vendors List */}
        <div className="space-y-4">
          {paginatedVendors.map((vendor) => (
            <VendorListCard key={vendor.id} vendor={vendor} />
          ))}
        </div>

        {/* Empty State */}
        {paginatedVendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No vendors found for &quot;{queryParam}&quot;.
            </p>
          </div>
        )}

        {/* Pagination & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span>{displayTitle.toLowerCase()}</span>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Page Info */}
        {sortedVendors.length > 0 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedVendors.length)} of{" "}
            {sortedVendors.length} vendors
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
