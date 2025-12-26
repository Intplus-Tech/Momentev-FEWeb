import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Coins,
  Star,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "New Bookings",
    value: "£13,382",
    change: "+14.5% vs last month",
    icon: CalendarDays,
    accent: "bg-primary/15 text-primary",
  },
  {
    title: "Checking Clients",
    value: "£13,382",
    change: "Due on Oct 23, 2025",
    icon: UsersRound,
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Total Income",
    value: "£13,382",
    change: "+14.5% vs last month",
    icon: Coins,
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Net Earning",
    value: "£13,382",
    change: "+14.5% vs last month",
    icon: ArrowUpRight,
    accent: "bg-primary/15 text-primary",
  },
];

const bookings = [
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Bridal Makeup",
    location: "Deen Hallway",
    time: "09:00 AM - 10:30 AM",
    date: "Dec 15, 2025",
    amount: "£13,382",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Dress Fitting",
    location: "Studio A",
    time: "12:30 PM - 02:00 PM",
    date: "Dec 18, 2025",
    amount: "£11,262",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Bridesmaid Trial",
    location: "Deen Hallway",
    time: "03:00 PM - 04:00 PM",
    date: "Dec 19, 2025",
    amount: "£7,382",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Engagement Shoot",
    location: "Studio B",
    time: "09:00 AM - 11:00 AM",
    date: "Dec 22, 2025",
    amount: "£9,382",
  },
];

const schedule = [
  {
    name: "Sarah Johnson",
    detail: "Wedding Consultation",
    time: "9:00 - 11:00",
  },
  {
    name: "James Wilson",
    detail: "Wedding Consultation",
    time: "9:00 - 11:00",
  },
  {
    name: "Sarah Johnson",
    detail: "Wedding Consultation",
    time: "9:00 - 11:00",
  },
];

const reviews = [
  {
    author: "Chimaka",
    date: "Jan 20, 2025",
    content:
      "Absolutely fantastic service for my wedding day! The makeup lasted all night, even through happy tears. Highly recommend for any bride!",
  },
  {
    author: "Chimaka",
    date: "Jan 20, 2025",
    content:
      "Absolutely fantastic service for my wedding day! The makeup lasted all night, even through happy tears. Highly recommend for any bride!",
  },
  {
    author: "Chimaka",
    date: "Jan 20, 2025",
    content:
      "Absolutely fantastic service for my wedding day! The makeup lasted all night, even through happy tears. Highly recommend for any bride!",
  },
];

const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">South London, UK</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">
            Welcome, Michelle
          </h1>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
          <p>Reach more clients on Momentev</p>
          <Button>Add New Service</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <CardTitle className="mt-2 text-2xl text-foreground">
                  {stat.value}
                </CardTitle>
              </div>
              <span
                className={`rounded-full p-3 text-sm font-medium ${stat.accent}`}
              >
                <stat.icon className="size-5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-primary">
                {stat.change}
              </p>
              <p className="text-xs text-muted-foreground">Updated just now</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80"
                      alt={booking.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {booking.name}
                    </p>
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
                <p className="text-sm font-semibold text-foreground">
                  {item.name}
                </p>
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
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>What clients are saying</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, index) => (
            <div
              key={`${review.author}-${index}`}
              className="flex h-full flex-col rounded-2xl border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {review.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      className="size-3 text-primary"
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {review.content}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default DashboardPage;
