import {
  CalendarClock,
  ClipboardList,
  Home,
  MessageCircle,
  Settings,
  CreditCard,
} from "lucide-react";

export const clientNavItems = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: Home,
  },
  {
    label: "My Bookings",
    href: "/client/bookings",
    icon: CalendarClock,
  },
  {
    label: "My Requests",
    href: "/client/requests",
    icon: ClipboardList,
  },
  {
    label: "Messages",
    href: "/client/messages",
    icon: MessageCircle,
  },
  {
    label: "Payment",
    href: "/client/payment",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
];
