import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const bookings = [
  {
    vendor: "Golden Lens Studio",
    service: "Photography",
    date: "Apr 18, 2026",
    status: "Confirmed",
  },
  {
    vendor: "Velvet & Co.",
    service: "Venue",
    date: "May 4, 2026",
    status: "Awaiting deposit",
  },
  {
    vendor: "North Bloom",
    service: "Florals",
    date: "May 12, 2026",
    status: "Contract sent",
  },
  {
    vendor: "Atlas Audio",
    service: "Production",
    date: "May 25, 2026",
    status: "Confirmed",
  },
];

export default function ClientBookingsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage every confirmed deliverable and milestone.
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Create booking</Button>
        </div>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Upcoming schedule</CardTitle>
          <CardDescription>Sorted by event date.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.vendor}>
                  <TableCell className="font-medium text-foreground">
                    {booking.vendor}
                  </TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "Confirmed" ? "secondary" : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
