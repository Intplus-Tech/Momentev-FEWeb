import type { ScheduleItem } from "../data";

import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ScheduleCard({ schedule }: { schedule: ScheduleItem[] }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Stay on top of your day</CardDescription>
        </div>
        <Button variant="ghost" size="icon-sm">
          <ArrowUpRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
          >
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
            <p className="mt-1 text-sm text-primary">{item.time}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full justify-between">
          View Full Calendar
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
