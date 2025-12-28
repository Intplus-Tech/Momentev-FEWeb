import type { ScheduleItem } from "../data";

import { ArrowRight, ArrowUpRight, MoreHorizontal } from "lucide-react";

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
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Today's Schedule</CardTitle>
        </div>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4 rotate-90" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {schedule.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="px-4 py-3 border border-b-0 last:border-b flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <span>
              <p className="text-sm font-semibold text-foreground">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </span>
            <p className="mt-1 text-sm text-primary">{item.time}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button variant="outline" className="w-full justify-between">
          View Full Calendar
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
