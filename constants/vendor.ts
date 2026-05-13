import {
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  House,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import type { PermissionModule } from "@/types/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /**
   * The backend permission module this nav item maps to.
   * Items without a permissionModule are always visible (e.g. Dashboard).
   * VendorStaff must have read: true for the mapped module to see the item.
   */
  permissionModule?: PermissionModule;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: House,
    // No permissionModule — Dashboard is always visible
  },
  {
    label: "My Bookings",
    href: "/vendor/bookings",
    icon: Calendar,
    permissionModule: "view_orders",
  },
  {
    label: "My Requests",
    href: "/vendor/requests",
    icon: ClipboardList,
    permissionModule: "view_orders",
  },
  {
    label: "My Quotes",
    href: "/vendor/quotes",
    icon: Briefcase,
    permissionModule: "view_orders",
  },
  {
    label: "Services",
    href: "/vendor/services",
    icon: Briefcase,
    permissionModule: "manage_services",
  },
  {
    label: "Payment",
    href: "/vendor/payment",
    icon: CreditCard,
    permissionModule: "finance",
  },
  {
    label: "Messages",
    href: "/vendor/messages",
    icon: MessageSquare,
    permissionModule: "chat",
  },
  {
    label: "Staff",
    href: "/vendor/staff",
    icon: Users,
    permissionModule: "manage_staff",
  },
  {
    label: "Settings",
    href: "/vendor/settings",
    icon: Settings,
    permissionModule: "business_profile",
  },
];
