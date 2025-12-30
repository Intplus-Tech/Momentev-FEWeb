"use client";

import Link from "next/link";
import { Bell, CalendarPlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import LogoSmall from "@/components/brand/LogoSmall";

export const ClientHeader = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <LogoSmall className="md:hidden" />

        <div className="hidden flex-1 items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="text-foreground">Next event:</span>
          <span className="font-medium text-primary">
            April 18 · Austin, TX
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground lg:hidden" />

          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="size-4 text-primary" />
            <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/client/requests">Create request</Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-1"
            asChild
          >
            <Link href="/client/bookings">
              <CalendarPlus2 className="size-3.5" />
              <span>New booking</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
