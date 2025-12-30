import {
  CalendarClock,
  ClipboardList,
  Home,
  MessageCircle,
  Settings,
  Wallet,
} from "lucide-react";

export const clientNavItems = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: Home,
  },
  {
    label: "Bookings",
    href: "/client/bookings",
    icon: CalendarClock,
  },
  {
    label: "Requests",
    href: "/client/requests",
    icon: ClipboardList,
  },
  {
    label: "Messages",
    href: "/client/messages",
    icon: MessageCircle,
    badge: "4",
  },
  {
    label: "Payments",
    href: "/client/payment",
    icon: Wallet,
  },
  {
    label: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
];
