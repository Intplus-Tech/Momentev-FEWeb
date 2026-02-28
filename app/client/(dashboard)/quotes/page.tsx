"use client";

import { Suspense } from "react";
import { QuotesDashboard } from "./_components/quotes-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

function LoadingSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[140px]" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function ClientQuotesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <QuotesDashboard />
    </Suspense>
  );
}
