import { cn } from "@/lib/utils";

import type { SummaryMetric } from "../data";

interface SummaryMetricsGridProps {
  metrics: SummaryMetric[];
}

export function SummaryMetricsGrid({ metrics }: SummaryMetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="rounded-3xl border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-semibold text-foreground">
                  {metric.value}
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    [
                      "text-emerald-500",
                      "text-foreground",
                      "text-foreground",
                      "text-emerald-500",
                    ][metrics.indexOf(metric) % 4]
                  )}
                >
                  {metric.change}
                </p>
              </div>

              <Icon
                className={cn(
                  "size-5",
                  [
                    "text-primary",
                    "text-amber-500",
                    "text-emerald-500",
                    "text-rose-500",
                  ][metrics.indexOf(metric) % 4]
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
