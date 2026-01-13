"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page if more than 1 page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1 text-primary"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
