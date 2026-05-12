"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";

import Logo from "@/components/brand/logo";
import LogoSmall from "@/components/brand/LogoSmall";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clientNavItems } from "@/constants/client";
import { cn } from "@/lib/utils";
import { useAuthLogout } from "@/hooks/use-auth-logout";
import { useUnreadBadgeCount } from "@/hooks/api/use-chat";
import { useSearchSuggestions } from "@/hooks/api/use-search-suggestions";
import { addRecentSearch } from "@/lib/search/recent-searches";

export const ClientSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { unreadCount } = useUnreadBadgeCount("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const authLogout = useAuthLogout();
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    refreshRecentSearches,
  } = useSearchSuggestions(searchQuery);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    addRecentSearch(q);
    refreshRecentSearches();
    router.push(`/search?q=${encodeURIComponent(q)}&page=1`);
  };

  const handleSuggestionSelect = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;

    setSearchQuery(nextQuery);
    addRecentSearch(nextQuery);
    refreshRecentSearches();
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(nextQuery)}&page=1`);
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
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Find a vendor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 120);
            }}
            className="rounded-full border border-border bg-background/80 pl-9 text-sm placeholder:text-muted-foreground"
          />
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden">
              <div className="max-h-72 overflow-y-auto py-1">
                {isSuggestionsLoading && suggestions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Loading suggestions...
                  </p>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.source}-${suggestion.value}`}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSuggestionSelect(suggestion.value);
                      }}
                    >
                      <span>{suggestion.value}</span>
                      <span className="ml-2 text-xs text-muted-foreground capitalize">
                        {suggestion.source}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No suggestions yet.
                  </p>
                )}
              </div>
            </div>
          )}
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
                  className="px-0 pl-2 text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={async () => {
                      setOpenMobile(false);
                      await authLogout("/client/auth/log-in");
                    }}
                    className="flex w-full justify-start gap-3 text-muted-foreground"
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
