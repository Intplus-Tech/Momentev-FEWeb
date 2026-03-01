"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";
import { Loader2 } from "lucide-react";

type FilterOption = {
  label: string;
  value: BookingStatus | "all";
};

const FILTER_OPTIONS: FilterOption[] = [
  { label: "All Bookings", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

export function BookingsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentStatus = searchParams.get("status") || "all";

  const handleFilterChange = useCallback(
    (status: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Updating bookings...</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            disabled={isPending}
            onClick={() => handleFilterChange(option.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
              currentStatus === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

