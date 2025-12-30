import {
  CalendarClock,
  ClipboardList,
  Home,
  MessageCircle,
  Settings,
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
    badge: "4",
  },
  {
    label: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
];
