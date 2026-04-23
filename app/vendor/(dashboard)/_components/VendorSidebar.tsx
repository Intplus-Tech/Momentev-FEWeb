"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Logo from "@/components/brand/logo";
import LogoSmall from "@/components/brand/LogoSmall";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, Search } from "lucide-react";
import { navItems } from "@/constants/vendor";
import { cn } from "@/lib/utils";
import { useAuthLogout } from "@/hooks/use-auth-logout";
import { useUnreadBadgeCount } from "@/hooks/api/use-chat";

export const VendorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { unreadCount } = useUnreadBadgeCount("vendor");
  const [searchQuery, setSearchQuery] = useState("");
  const authLogout = useAuthLogout();

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
      <SidebarHeader className="gap-4 px-4 py-5 bg-white group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4 group-data-[collapsible=icon]:gap-3">
        <Logo className="h-7 w-auto group-data-[collapsible=icon]:hidden" />
        <LogoSmall
          className="hidden group-data-[collapsible=icon]:block mx-auto"
          size={32}
        />
        {/* <div className="relative">
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
        </div> */}
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
                        "group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                        className="flex w-full items-center gap-3 text-current group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                      >
                        <item.icon className="size-5 text-current" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
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
                  <button
                    type="button"
                    onClick={async () => {
                      setOpenMobile(false);
                      await authLogout("/vendor/auth/log-in");
                    }}
                    className="flex w-full justify-start gap-3 text-destructive"
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </button>
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
