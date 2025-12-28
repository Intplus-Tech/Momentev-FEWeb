import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HeroSummary } from "../data";

export type DashboardHeroProps = {
  data: HeroSummary;
};

export const DashboardHero = ({ data }: DashboardHeroProps) => {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{data.location}</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">
            Welcome, {data.name}
          </h1>
          <p className="text-sm text-muted-foreground">{data.statement}</p>
        </div>
        <div className="flex flex-wrap gap-5">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="min-w-[120px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          ))}
        </div>
        <Button size="sm">{data.ctaLabel}</Button>
      </div>

      <Card className="w-full max-w-sm border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{data.nextDelivery.label}</CardTitle>
          <CardDescription>
            Stay prepped for your next milestone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 rounded-2xl border border-dashed border-border bg-muted/60 p-4">
          <p className="text-sm font-semibold text-foreground">
            {data.nextDelivery.engagement}
          </p>
          <p className="text-sm text-primary">{data.nextDelivery.due}</p>
        </CardContent>
      </Card>
    </div>
  );
};
