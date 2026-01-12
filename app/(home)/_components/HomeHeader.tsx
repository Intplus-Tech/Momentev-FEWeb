"use client";

import { useState } from "react";
import Logo from "@/components/brand/logo";
import { Search, MapPin, CircleUserIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const locations = [
  "East London",
  "West London",
  "Central London",
  "North London",
  "South London",
];

export default function HomeHeader() {
  const [selectedLocation, setSelectedLocation] = useState("East London");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-background fixed top-0 left-0 right-0 w-full shadow-sm z-50 border-b">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
          <div className="flex items-center  h-12 p-0 w-full  rounded-md overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 px-4 py-2 focus-within:border-b border-primary">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent placeholder:text-muted-foreground"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Location Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto py-2 px-3 gap-1.5 rounded-none hover:bg-muted/50 font-normal text-sm"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="hidden lg:inline">{selectedLocation}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {locations.map((location) => (
                  <DropdownMenuItem
                    key={location}
                    onClick={() => setSelectedLocation(location)}
                    className={
                      selectedLocation === location
                        ? "bg-primary/10 text-primary font-medium"
                        : ""
                    }
                  >
                    {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Find Button */}
            <Button className="ml-4 rounded-r-md px-6 min-w-[160px] border-none">
              Find
            </Button>
          </div>
        </div>

        {/* Desktop Auth Buttons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Button variant="ghost" className="gap-2" asChild>
            <Link href="/client/auth/log-in">
              <CircleUserIcon className="w-4 h-4" />
              Sign in
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/auth/sign-up">List your Business</Link>
          </Button>
        </div>

        {/* Mobile Menu - Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="min-w-full px-6">
            <SheetHeader className="border-b pb-4">
              <SheetTitle asChild>
                <div>
                  <Logo />
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigation menu
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 py-6 h-full">
              {/* Mobile Search */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Search
                </p>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-lg border border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find a vendor..."
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Mobile Location */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedLocation}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[268px] sm:w-[318px]">
                    {locations.map((location) => (
                      <DropdownMenuItem
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={
                          selectedLocation === location
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
                        }
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <SheetClose asChild>
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Find Vendors
                </Button>
              </SheetClose>

              <nav className="space-y-2 mt-auto">
                <Separator />
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Account
                </p>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full  gap-2" asChild>
                    <Link href="/client/auth/log-in">
                      <CircleUserIcon className="w-4 h-4" />
                      Sign in / Sign up
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="w-full" asChild>
                    <Link href="/vendor/auth/sign-up">List your Business</Link>
                  </Button>
                </SheetClose>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
