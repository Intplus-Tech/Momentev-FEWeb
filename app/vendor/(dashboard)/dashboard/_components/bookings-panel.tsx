import Image from "next/image";

import type { Booking } from "../data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BookingsPanelProps {
  bookings: Booking[];
}

export function BookingsPanel({ bookings }: BookingsPanelProps) {
  return (
    <Card className="border border-border shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Next Bookings</CardTitle>
          <CardDescription>Upcoming appointments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={`${booking.name}-${booking.time}`}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 overflow-hidden rounded-full border border-border">
                <Image
                  src={booking.avatar}
                  alt={booking.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-foreground">{booking.name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.service} · {booking.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.date} · {booking.time}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {booking.status}
            </Badge>
            <p className="w-full text-right text-base font-semibold text-foreground md:w-auto">
              {booking.amount}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
