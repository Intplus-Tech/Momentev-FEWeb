"use client";

import Link from "next/link";
import { Search, FileText, LayoutDashboard, MessageSquare, Settings, LogOut, CircleUserIcon } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/types/auth";

import type { AuthIntent } from "./types";

type MobileMenuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  locationSelector: React.ReactNode;
  userLat?: number | null;
  userLong?: number | null;
  selectedRadius: number;
  user?: UserProfile;
  isUserLoading: boolean;
  dashboardLink: string;
  messagesLink: string;
  settingsLink: string;
  onLogout: () => void;
  onOpenAuthModal: (intent: AuthIntent) => void;
};

export function MobileMenuSheet({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  locationSelector,
  userLat,
  userLong,
  selectedRadius,
  user,
  isUserLoading,
  dashboardLink,
  messagesLink,
  settingsLink,
  onLogout,
  onOpenAuthModal,
}: MobileMenuSheetProps) {
  const isClient = user?.role === "CUSTOMER" || user?.role === "customer";

  const handleSearchAndClose = () => {
    onSearch();
    onOpenChange(false);
  };

  const openAuthModalFromMobile = (intent: AuthIntent) => {
    onOpenChange(false);
    onOpenAuthModal(intent);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm p-0 flex flex-col"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 border-b">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-lg border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchAndClose();
                  }
                }}
                placeholder="Find a vendor..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent"
              />
            </div>

            {locationSelector}

            {userLat && userLong && (
              <p className="text-xs text-muted-foreground">
                Searching within {selectedRadius} km
              </p>
            )}

            <Button className="w-full" onClick={handleSearchAndClose}>
              <Search className="w-4 h-4 mr-2" />
              Find Vendors
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {(!user || isClient) && (
              !user ? (
                <button
                  onClick={() => openAuthModalFromMobile("post-request")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors w-full"
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Post A Request
                </button>
              ) : (
                <Link
                  href="/client/custom-request"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Post A Request
                </Link>
              )
            )}
          </nav>

          <div className="border-t p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Account
            </p>
            {isUserLoading ? (
              <div className="space-y-3 px-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.avatar?.url}
                      alt={user.firstName}
                    />
                    <AvatarFallback className="bg-muted text-primary text-sm font-semibold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Separator className="my-2" />

                <Link
                  href={dashboardLink}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <Link
                  href={messagesLink}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Messages
                </Link>
                <Link
                  href={settingsLink}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>

                <Separator className="my-2" />

                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => openAuthModalFromMobile("sign-in")}
                >
                  <CircleUserIcon className="w-4 h-4" />
                  Sign in / Sign up
                </Button>
                <Button
                  className="w-full"
                  onClick={() => openAuthModalFromMobile("list-business")}
                >
                  List your Business
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
