import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type MetricBreakdown = { label: string; value: string };
type MetricCardData = {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  period: string;
  icon: LucideIcon;
  breakdown: MetricBreakdown[];
};


const trendClasses = {
  up: "text-emerald-600",
  down: "text-destructive",
};

export const MetricsGrid = ({ metrics }: { metrics: MetricCardData[] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="mt-2 text-2xl text-foreground">
                {metric.value}
              </CardTitle>
            </div>
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <metric.icon className="size-5" />
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p
              className={cn(
                "text-sm font-semibold",
                trendClasses[metric.trend]
              )}
            >
              {metric.change}
            </p>
            <p className="text-xs text-muted-foreground">{metric.period}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {metric.breakdown.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
