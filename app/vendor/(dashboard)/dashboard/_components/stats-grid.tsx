import type { DashboardStat } from "../data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border border-border">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <CardTitle className="mt-2 text-2xl text-foreground">
                {stat.value}
              </CardTitle>
            </div>
            <span
              className={`rounded-full p-3 text-sm font-medium ${stat.accent}`}
            >
              <stat.icon className="size-5" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-primary">{stat.change}</p>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
