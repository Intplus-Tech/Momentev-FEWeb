"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Search } from "lucide-react";
import { navItems } from "@/constants/vendor";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useUnreadBadgeCount } from "@/hooks/api/use-chat";

export const VendorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, data } = useUserProfile();
  const { unreadCount } = useUnreadBadgeCount("vendor");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}&page=1`);
  };


  return (
    <Sidebar
      collapsible="icon"
      className="border-border bg-white text-foreground"
    >
      <SidebarHeader className="gap-4 px-4 py-5 bg-white">
        <Logo className="h-7 w-auto" />
        <div className="flex items-center gap-3">
          {isLoading ? (
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
                  src={data?.avatar?.url} 
                  alt={data?.firstName ? `${data.firstName} ${data.lastName}` : "Vendor avatar"} 
                />
                <AvatarFallback>
                  {data?.firstName ? `${data.firstName.charAt(0)}${data.lastName?.charAt(0) || ""}`.toUpperCase() : "VN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">
                  {data?.vendor?.businessProfile?.businessName || 
                   `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || 'Vendor'}
                </p>
                <p className="text-xs text-muted-foreground">momentev vendor</p>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Find vendor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="rounded-full border border-border bg-background/80 pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navItems.map((item) => {
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
                    {item.label === "Messages" && unreadCount > 0 ? (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground">
                        {unreadCount}
                      </SidebarMenuBadge>
                    ) : "badge" in item && (item as any).badge ? (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground">
                        {(item as any).badge as React.ReactNode}
                      </SidebarMenuBadge>
                    ) : undefined}
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="py-3 pr-0 text-sm font-medium hover:bg-destructive/10 hover:text-destructive"
                >
                  <form action={() => logout("/vendor/auth/log-in")}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="flex w-full justify-start gap-3 text-destructive"
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
