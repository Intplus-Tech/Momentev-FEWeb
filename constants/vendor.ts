import {
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  House,
  MessageSquare,
  Settings,
} from "lucide-react";

export const navItems = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: House,
  },
  {
    label: "My Bookings",
    href: "/vendor/bookings",
    icon: Calendar,
  },
  {
    label: "My Requests",
    href: "/vendor/requests",
    icon: ClipboardList,
  },
  {
    label: "Services",
    href: "/vendor/services",
    icon: Briefcase,
  },
  {
    label: "Payment",
    href: "/vendor/payment",
    icon: CreditCard,
  },
  {
    label: "Messages",
    href: "/vendor/messages",
    icon: MessageSquare,
    badge: "23",
  },
  {
    label: "Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
];