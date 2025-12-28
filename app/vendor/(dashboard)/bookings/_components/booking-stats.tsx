import type { BookingStat } from "../data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BookingStats({ stats }: { stats: BookingStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <p className="text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <stat.icon className="size-5" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-primary">{stat.helper}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
