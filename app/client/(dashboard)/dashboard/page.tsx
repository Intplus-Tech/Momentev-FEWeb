import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Active requests", value: "03", detail: "2 awaiting quotes" },
  { label: "Upcoming bookings", value: "04", detail: "Next in 18 days" },
  { label: "Vendors chatting", value: "07", detail: "3 new replies" },
  { label: "Budget used", value: "$18.4k", detail: "62% of plan" },
];

const upcomingBookings = [
  {
    vendor: "Golden Lens Studio",
    date: "Apr 18, 2026",
    service: "Photography",
  },
  { vendor: "Velvet & Co.", date: "May 4, 2026", service: "Venue" },
  { vendor: "North Bloom", date: "May 12, 2026", service: "Florals" },
];

const openRequests = [
  {
    title: "After-party lighting",
    responses: 2,
    budget: "$4.5k",
    status: "In review",
  },
  {
    title: "Welcome dinner caterer",
    responses: 5,
    budget: "$9k",
    status: "Comparing",
  },
  {
    title: "Transportation fleet",
    responses: 1,
    budget: "$6k",
    status: "Pending",
  },
];

const recommendedVendors = [
  { name: "Studio Kale", rating: "4.9", category: "Photo & video" },
  { name: "Atlas Audio", rating: "4.8", category: "Production" },
  { name: "Grounded Events", rating: "5.0", category: "Planning" },
];

export default function ClientDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Monitor activity across your events and requests.
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-border">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {stat.detail}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming bookings</CardTitle>
              <Badge variant="secondary">3 confirmed</Badge>
            </div>
            <CardDescription>
              Stay ahead of the next vendor touchpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.vendor}
                className="flex flex-col gap-1 rounded-lg border border-border/80 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    {booking.vendor}
                  </span>
                  <span className="text-muted-foreground">
                    {booking.service}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{booking.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Active requests</CardTitle>
            <CardDescription>Vendors currently responding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openRequests.map((request) => (
              <div
                key={request.title}
                className="flex flex-col gap-2 rounded-lg border border-border/80 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    {request.title}
                  </span>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{request.responses} responses</span>
                  <span>{request.budget}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Suggested vendors</CardTitle>
          <CardDescription>Curated based on your current plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {recommendedVendors.map((vendor) => (
            <div
              key={vendor.name}
              className="rounded-lg border border-border/80 p-4 text-sm"
            >
              <p className="font-semibold text-foreground">{vendor.name}</p>
              <p className="text-muted-foreground">{vendor.category}</p>
              <p className="mt-4 text-sm font-medium text-primary">
                {vendor.rating} • Avg. rating
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
