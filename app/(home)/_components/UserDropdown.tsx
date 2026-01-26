"use strict";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { UserProfile } from "@/types/auth";
import { redirect } from "next/navigation";

interface UserDropdownProps {
  user: UserProfile;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const isVendor = user.role === "VENDOR";

  const dashboardLink = isVendor ? "/vendor/dashboard" : "/client/dashboard";
  // Assuming generic settings/messages paths for now based on dashboard structure
  const settingsLink = isVendor
    ? "/vendor/dashboard/settings"
    : "/client/dashboard/settings";
  const messagesLink = isVendor
    ? "/vendor/dashboard/messages"
    : "/client/dashboard/messages";

  const handleLogout = async () => {
    await logout();
    redirect("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-10 items-center gap-3 rounded-full px-2 transition-colors hover:bg-transparent hover:border-primary focus-visible:border-primary focus-visible:bg-transparent focus-visible:text-primary data-[state=open]:bg-transparent data-[state=open]:border-primary data-[state=open]:text-primary"
        >
          <Avatar className="h-8 w-8 border border-black shadow-sm">
            <AvatarImage src={user.avatar?.url} alt={user.firstName} />
            <AvatarFallback className="bg-muted text-primary text-xs font-semibold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="hidden font-medium text-white md:block group-data-[state=open]:text-white">
            {user.firstName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
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
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardLink} className="cursor-pointer w-full">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={messagesLink} className="cursor-pointer w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
              {/* Notification badge could go here */}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={settingsLink} className="cursor-pointer w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
