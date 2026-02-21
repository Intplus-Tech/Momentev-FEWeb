import Image from "next/image";
import Link from "next/link";

import type { BookingResponse, PopulatedCustomer } from "@/types/booking";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getCustomer(customerId: BookingResponse["customerId"]) {
  if (typeof customerId === "object" && customerId !== null) {
    return customerId as PopulatedCustomer;
  }
  return null;
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  confirmed: "default",
  paid: "default",
  completed: "secondary",
  pending: "outline",
  pending_payment: "outline",
  cancelled: "destructive",
  rejected: "destructive",
};

export function BookingsPanel({ bookings }: { bookings: BookingResponse[] }) {
  return (
    <Card className="border border-border lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Next Bookings</CardTitle>
          <CardDescription>Upcoming appointments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/vendor/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No upcoming bookings
          </p>
        ) : (
          bookings.map((booking) => {
            const customer = getCustomer(booking.customerId);
            const name = customer
              ? `${customer.firstName} ${customer.lastName}`.trim()
              : "Client";
            const avatar = customer?.avatar;

            return (
              <div
                key={booking._id}
                className="flex flex-wrap items-center gap-4 rounded-md border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 overflow-hidden rounded-full border border-border bg-muted">
                    {avatar && (avatar.startsWith("http://") || avatar.startsWith("https://")) ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.eventDetails.title} ·{" "}
                      {booking.location.addressText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(booking.eventDetails.startDate),
                        "MMM d, yyyy"
                      )}{" "}
                      ·{" "}
                      {format(new Date(booking.eventDetails.startDate), "h:mm a")}
                      {" – "}
                      {format(new Date(booking.eventDetails.endDate), "h:mm a")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={STATUS_VARIANT[booking.status] ?? "outline"}
                  className="ml-auto capitalize"
                >
                  {booking.status.replace("_", " ")}
                </Badge>
                <p className="w-full text-right text-base font-semibold text-foreground md:w-auto">
                  {booking.currency === "GBP" ? "£" : "$"}
                  {booking.amounts.total.toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
