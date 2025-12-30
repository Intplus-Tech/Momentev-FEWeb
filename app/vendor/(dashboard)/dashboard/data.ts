import {
  ArrowUpRight,
  CalendarDays,
  Coins,
  LucideIcon,
  UsersRound,
} from "lucide-react";

export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  accent: string;
  icon: LucideIcon;
};

export type Booking = {
  name: string;
  status: string;
  service: string;
  location: string;
  time: string;
  date: string;
  amount: string;
  avatar: string;
};

export type ScheduleItem = {
  name: string;
  detail: string;
  time: string;
};

export type Review = {
  author: string;
  date: string;
  content: string;
};

export const heroContent = {
  location: "South London, UK",
  name: "Michelle",
  helperText: "Reach more clients on Momentev",
  ctaLabel: "Add New Service",
};

export const stats: DashboardStat[] = [
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

export const bookings: Booking[] = [
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Bridal Makeup",
    location: "Deen Hallway",
    time: "09:00 AM - 10:30 AM",
    date: "Dec 15, 2025",
    amount: "£13,382",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Dress Fitting",
    location: "Studio A",
    time: "12:30 PM - 02:00 PM",
    date: "Dec 18, 2025",
    amount: "£11,262",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Bridesmaid Trial",
    location: "Deen Hallway",
    time: "03:00 PM - 04:00 PM",
    date: "Dec 19, 2025",
    amount: "£7,382",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
  },
  {
    name: "Jade Adamz",
    status: "Verified",
    service: "Engagement Shoot",
    location: "Studio B",
    time: "09:00 AM - 11:00 AM",
    date: "Dec 22, 2025",
    amount: "£9,382",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
  },
];

export const schedule: ScheduleItem[] = [
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

export const reviews: Review[] = [
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
