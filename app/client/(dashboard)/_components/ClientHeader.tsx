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

        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground lg:hidden" />

          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="size-4 text-primary" />
            <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/client/requests">Create a custom request</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
