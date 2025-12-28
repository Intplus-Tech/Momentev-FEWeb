import type { ComponentType, SVGProps } from "react";

import { CalendarDays, ClipboardList, Coins, GaugeCircle } from "lucide-react";

export type BookingStat = {
  label: string;
  value: string;
  helper: string;
  subtext: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type ScheduleEntry = {
  date: string;
  time: string;
  name: string;
  service: string;
  linkLabel: string;
};

export type ConfirmedBooking = {
  id: string;
  client: string;
  date: string;
  service: string;
  amount: string;
  status?: "upcoming" | "action";
  timeframe: "this-week" | "next-week" | "this-month";
};

export const bookingStats: BookingStat[] = [
  {
    label: "Total Bookings",
    value: "3",
    helper: "+14.5% vs last month",
    subtext: "As of Oct 25, 2025",
    icon: CalendarDays,
  },
  {
    label: "Pending Quotes",
    value: "5",
    helper: "+2 new this week",
    subtext: "Due by Oct 28, 2025",
    icon: ClipboardList,
  },
  {
    label: "Upcoming Revenue",
    value: "£13,382",
    helper: "+14.5% vs last month",
    subtext: "Paid invoices",
    icon: Coins,
  },
  {
    label: "Response Rate",
    value: "93%",
    helper: "+4.1% vs last month",
    subtext: "Last 30 days",
    icon: GaugeCircle,
  },
];

export const scheduleEntries: ScheduleEntry[] = [
  {
    date: "Oct 25, 2025",
    time: "9:00-11:00",
    name: "Sarah Johnson",
    service: "Wedding Consultation",
    linkLabel: "View Calendar",
  },
  {
    date: "Oct 26, 2025",
    time: "9:00-11:00",
    name: "James Wilson",
    service: "Corporate Event Photography",
    linkLabel: "View Calendar",
  },
  {
    date: "Oct 28, 2025",
    time: "9:00-11:00",
    name: "James Wilson",
    service: "Corporate Event Photography",
    linkLabel: "View Calendar",
  },
];

const timeframes: ConfirmedBooking["timeframe"][] = [
  "this-week",
  "next-week",
  "this-month",
];

export const confirmedBookings: ConfirmedBooking[] = Array.from({ length: 12 }).map(
  (_, index) => ({
    id: `B-90${index + 1}`,
    client: index % 2 === 0 ? "Sarah Johnson" : "James Wilson",
    date: "Oct 28",
    service: index % 2 === 0 ? "Wedding Photo" : "Corporate Event Photo",
    amount: index % 2 === 0 ? "£1,200" : "£1,380",
    status: index < 9 ? "upcoming" : "action",
    timeframe: timeframes[index % timeframes.length],
  })
);
