"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  Sparkles,
  Wallet,
  MessageSquare,
  Settings,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: Home },
  { href: "/vendor/bookings", label: "My Bookings", icon: Calendar },
  { href: "/vendor/requests", label: "My Requests", icon: FileText },
  { href: "/vendor/services", label: "Services", icon: Sparkles },
  { href: "/vendor/payment", label: "Payment", icon: Wallet },
  { href: "/vendor/messages", label: "Messages", icon: MessageSquare },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed left-0 top-0 h-screen w-64 border-r bg-white pt-16 z-30 lg:block">
      <div className="flex flex-col h-full">
        {/* Back to Website Link */}
        <div className="px-4 py-4 border-b h-13">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Website
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors pointer-events-none cursor-not-allowed opacity-50",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
