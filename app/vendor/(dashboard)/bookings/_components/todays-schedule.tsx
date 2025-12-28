import type { ScheduleEntry } from "../data";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TodaysSchedule({ entries }: { entries: ScheduleEntry[] }) {
  return (
    <Card className="border border-border p-6">
      <CardHeader className="flex flex-row items-start justify-between p-0">
        <div>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Manage all your appointments in one place
          </CardDescription>
        </div>
        <Button variant="link" className="px-0 text-primary" asChild>
          <Link href="#">View All Schedule</Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-hidden rounded-md p-0 border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date &amp; Time</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Service</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={`${entry.date}-${entry.name}`}
                className="border-t border-border/80"
              >
                <td className="px-4 py-3 text-foreground">
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{entry.name}</td>
                <td className="px-4 py-3 text-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>{entry.service}</span>
                    <Link href="#" className="text-xs font-medium text-primary">
                      {entry.linkLabel}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start text-primary"
        >
          + Add Booking
        </Button>
      </CardContent>
    </Card>
  );
}
