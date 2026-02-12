"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";

import Logo from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clientNavItems } from "@/constants/client";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { useUserProfile } from "@/hooks/api/use-user-profile";

export const ClientSidebar = () => {
  const pathname = usePathname();
  const { data: user, isLoading: isUserLoading } = useUserProfile();

  const initials = (() => {
    const first = user?.firstName?.trim();
    const last = user?.lastName?.trim();

    const segments = [first, ...(last ? last.split(/\s+/) : [])].filter(
      Boolean,
    ) as string[];
    const letters = segments
      .map((segment: string) => segment[0])
      .filter(Boolean);
    const value = letters.join("").slice(0, 2).toUpperCase();

    return value || "CL";
  })();

  return (
    <Sidebar
      collapsible="icon"
      className="border-border bg-white text-foreground"
    >
      <SidebarHeader className="gap-4 px-4 py-5 bg-white">
        <Logo className="h-7 w-auto" />
        <div className="flex items-center gap-3">
          {isUserLoading ? (
            <>
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.avatar?.url}
                  alt={
                    user?.firstName + " " + user?.lastName || "Client avatar"
                  }
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">
                  {user?.firstName}
                </p>
                <p className="text-xs text-muted-foreground">momentev client</p>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Find a vendor or city"
            className="rounded-full border border-border bg-background/80 pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {clientNavItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "group relative rounded-sm px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted/60",
                        "before:absolute before:left-1 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-transparent",
                        "data-[active=true]:bg-transparent data-[active=true]:text-primary data-[active=true]:shadow-none",
                        "data-[active=true]:before:bg-primary",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3 text-current"
                      >
                        <item.icon className="size-4 text-current" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="px-0 py-3 text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  <form action={() => logout("/client/auth/log-in")}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="flex w-full justify-start gap-3 text-muted-foreground"
                    >
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </Button>
                  </form>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
