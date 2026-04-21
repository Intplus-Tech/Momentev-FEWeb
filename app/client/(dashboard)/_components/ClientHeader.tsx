"use client";

import Link from "next/link";
import { Bell, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import LogoSmall from "@/components/brand/LogoSmall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";
import { useConversations } from "@/hooks/api/use-chat";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { logout } from "@/lib/actions/auth";

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim();
  const last = lastName?.trim();

  const segments = [first, ...(last ? last.split(/\s+/) : [])].filter(
    Boolean,
  ) as string[];
  const letters = segments.map((segment) => segment[0]).filter(Boolean);

  return letters.join("").slice(0, 2).toUpperCase() || "CL";
};

export const ClientHeader = () => {
  const pathname = usePathname();
  const isMessagesPage = pathname?.startsWith("/client/messages");
  const { data: conversations = [] } = useConversations();
  const { data: user, isLoading: isUserLoading } = useUserProfile();

  const handleLogout = async () => {
    await logout("/client/auth/log-in");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <LogoSmall className="md:hidden" />

        {isMessagesPage && (
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none">Messages</h1>
            <p className="text-xs text-muted-foreground">
              {conversations.length} Active conversations
            </p>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground lg:hidden" />

          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="size-4 text-primary" />
            <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/client/custom-request">Create a custom request</Link>
          </Button>

          <div className="hidden md:flex items-center gap-3">
            {isUserLoading ? (
              <>
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-full px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    aria-label="Open profile menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.avatar?.url}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {/* <div className="flex flex-col leading-tight">
                      <p className="text-sm font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                    </div> */}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="cursor-pointer w-full">
                      <UserRound className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
