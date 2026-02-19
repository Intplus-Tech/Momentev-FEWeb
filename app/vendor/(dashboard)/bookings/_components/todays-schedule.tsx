import { format, isToday, isTomorrow, isFuture } from "date-fns";
import Link from "next/link";

import type { BookingResponse, PopulatedCustomer } from "@/types/booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getClientName(booking: BookingResponse): string {
  const customer = booking.customerId;
  if (typeof customer === "string") return customer;
  const c = customer as PopulatedCustomer;
  return `${c.firstName} ${c.lastName}`.trim();
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM dd, yyyy");
}

export function TodaysSchedule({ bookings }: { bookings: BookingResponse[] }) {
  // Show confirmed + upcoming bookings, sorted by startDate, max 5
  const upcomingEntries = bookings
    .filter((b) => {
      const start = new Date(b.eventDetails.startDate);
      return (
        (b.status === "confirmed" || b.status === "pending_payment" || b.status === "pending") &&
        (isToday(start) || isFuture(start))
      );
    })
    .sort(
      (a, b) =>
        new Date(a.eventDetails.startDate).getTime() -
        new Date(b.eventDetails.startDate).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="border border-border p-6">
      <CardHeader className="flex flex-row items-start justify-between p-0">
        <div>
          <CardTitle>Upcoming Schedule</CardTitle>
          <CardDescription>
            Your next confirmed and pending bookings
          </CardDescription>
        </div>
        <Button variant="link" className="px-0 text-primary" asChild>
          <Link href="#">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-hidden rounded-md p-0 border border-border mt-4">
        {upcomingEntries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No upcoming bookings
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Event</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEntries.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-border/80"
                >
                  <td className="px-4 py-3 text-foreground">
                    <p className="font-medium">
                      {getDateLabel(booking.eventDetails.startDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.eventDetails.startDate), "h:mm a")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {getClientName(booking)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span>{booking.eventDetails.title}</span>
                      <Link
                        href="#"
                        className="text-xs font-medium text-primary"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
