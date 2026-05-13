"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Bell, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";

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
import { ClientActionBlockedDialog } from "@/components/shared/client-action-blocked-dialog";
import { useAuthLogout } from "@/hooks/use-auth-logout";
import { useConversations } from "@/hooks/api/use-chat";
import { useClientActionGuard } from "@/hooks/use-client-action-guard";
import { CLIENT_BAN_DESCRIPTION, CLIENT_BAN_TITLE } from "@/lib/client-access";

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
  const router = useRouter();
  const pathname = usePathname();
  const isMessagesPage = pathname?.startsWith("/client/messages");
  const { data: conversations = [] } = useConversations();
  const { data: user, isLoading: isUserLoading, isBanned, canPerformAction } =
    useClientActionGuard();
  const authLogout = useAuthLogout();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  const handleLogout = async () => {
    await authLogout("/client/auth/log-in");
  };

  const handleCreateCustomRequest = () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    router.push("/client/custom-request");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      {isBanned && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-50 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">{CLIENT_BAN_TITLE}</p>
              <p className="text-sm text-foreground/80">{CLIENT_BAN_DESCRIPTION}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0 border-amber-500/30 bg-background/70 text-foreground hover:bg-background"
            >
              <a href="mailto:support@momentev.com">Contact support</a>
            </Button>
          </div>
        </div>
      )}
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

          <NotificationBell />

          <Button size="sm" className="hidden sm:inline-flex" onClick={handleCreateCustomRequest}>
            Create a custom request
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
                    className="flex items-center gap-3 rounded-full px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 border"
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
                    <div className="flex flex-col leading-tight">
                      <p className="text-sm font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      {/* <p>{user.status}</p> */}
                      <p className="text-xs text-muted-foreground">
                        Momentev client
                      </p>
                    </div>
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
        <ClientActionBlockedDialog
          open={showBlockedDialog}
          onOpenChange={setShowBlockedDialog}
        />
      </div>
    </header>
  );
};
