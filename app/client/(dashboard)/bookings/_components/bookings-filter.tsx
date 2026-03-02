"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";
import { Loader2, Filter } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "all";
  const currentStatusLabel =
    FILTER_OPTIONS.find((option) => option.value === currentStatus)?.label ||
    "All Bookings";

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

      if (isMobile) {
        setDrawerOpen(false);
      }
    },
    [pathname, router, searchParams, isMobile],
  );

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Updating bookings...
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        {isMobile ? (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-foreground">
                  {currentStatusLabel}
                </span>
              </div>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isPending}
                  aria-label="Open booking filters"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </DrawerTrigger>
            </div>
            <DrawerContent className="p-0">
              <DrawerHeader className="text-left">
                <DrawerTitle>Filter bookings</DrawerTitle>
                <p className="text-sm text-muted-foreground">
                  Choose a status to narrow down your bookings.
                </p>
              </DrawerHeader>
              <div className="px-4 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        currentStatus === option.value ? "default" : "outline"
                      }
                      disabled={isPending}
                      onClick={() => handleFilterChange(option.value)}
                      className={cn(
                        "w-full justify-center",
                        isPending && "opacity-50",
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <DrawerClose asChild>
                  <Button variant="secondary" className="w-full">
                    Done
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
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
                  isPending && "opacity-50 cursor-not-allowed",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
