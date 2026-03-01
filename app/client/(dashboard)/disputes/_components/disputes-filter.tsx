"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const STATUSES = [
  { id: "all", label: "All Disputes" },
  { id: "mediation", label: "Mediation" },
  { id: "evidence", label: "Awaiting Evidence" },
  { id: "review", label: "Under Review" },
  { id: "escalated", label: "Escalated" },
  { id: "closed", label: "Closed" },
  { id: "archived", label: "Archived" },
];

export function DisputesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="mb-6 relative w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-1">
          {STATUSES.map((status) => (
            <button
              key={status.id}
              onClick={() => {
                router.push(
                  pathname + "?" + createQueryString("status", status.id)
                );
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                currentStatus === status.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
