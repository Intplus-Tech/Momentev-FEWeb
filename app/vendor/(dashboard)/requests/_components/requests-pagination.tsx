"use client";

import { cn } from "@/lib/utils";

import { buildPagination } from "./requests-utils";

interface RequestsPaginationProps {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

export function RequestsPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
}: RequestsPaginationProps) {
  const paginationSlots = buildPagination(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-dashed border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <p>
        Showing {rangeStart}–{rangeEnd} of {total} results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(slot)}
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
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "rounded-full px-3 py-1 text-primary",
            page === totalPages && "pointer-events-none opacity-40"
          )}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
