import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type BookingStatusTone = "warning" | "success";

export type BookingDetail = {
  label: string;
  value: string;
};

export type BookingCardData = {
  id: string;
  title: string;
  details: BookingDetail[];
  eventInfo: {
    date: string;
    service: string;
    status: string;
    tone: BookingStatusTone;
  };
  timeline: string[];
  primaryAction: string;
  secondaryActions: string[];
};

type BookingCardProps = {
  booking: BookingCardData;
};

export function BookingCard({ booking }: BookingCardProps) {
  const StatusIcon =
    booking.eventInfo.tone === "warning" ? AlertTriangle : CheckCircle2;

  return (
    <Card key={booking.id} className="border border-border/70">
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-[1.6fr_auto] md:items-start">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              {booking.title}
            </p>
            {booking.details.map((detail) => (
              <p key={detail.label} className="text-sm text-muted-foreground">
                {detail.label}: {detail.value}
              </p>
            ))}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground md:text-right">
            <p>{booking.eventInfo.date}</p>
            <p>Service: {booking.eventInfo.service}</p>
            <p
              className={cn(
                "flex items-center gap-1 text-sm font-medium md:justify-end",
                booking.eventInfo.tone === "warning"
                  ? "text-destructive"
                  : "text-emerald-600"
              )}
            >
              <StatusIcon className="h-4 w-4" />
              Status: {booking.eventInfo.status}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[2fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-foreground">Timeline</p>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {booking.timeline.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button>{booking.primaryAction}</Button>
            {booking.secondaryActions.map((action) => (
              <Button key={action} variant="link" className="px-0 text-primary">
                {action}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
