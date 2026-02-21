import type { BookingResponse, PopulatedCustomer } from "@/types/booking";

import { format, isToday } from "date-fns";
import { ArrowRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getCustomerName(customerId: BookingResponse["customerId"]) {
  if (typeof customerId === "object" && customerId !== null) {
    const c = customerId as PopulatedCustomer;
    return `${c.firstName} ${c.lastName}`.trim();
  }
  return "Client";
}

export function ScheduleCard({ bookings }: { bookings: BookingResponse[] }) {
  const todaysBookings = bookings.filter((b) =>
    isToday(new Date(b.eventDetails.startDate))
  );

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
        {todaysBookings.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No bookings scheduled for today
          </p>
        ) : (
          todaysBookings.map((booking, index) => (
            <div
              key={`${booking._id}-${index}`}
              className="flex cursor-pointer items-center justify-between border border-b-0 px-4 py-3 transition-colors last:border-b hover:bg-muted/50"
            >
              <span>
                <p className="text-sm font-semibold text-foreground">
                  {getCustomerName(booking.customerId)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.eventDetails.title}
                </p>
              </span>
              <p className="mt-1 text-sm text-primary">
                {format(new Date(booking.eventDetails.startDate), "h:mm a")}
              </p>
            </div>
          ))
        )}
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
