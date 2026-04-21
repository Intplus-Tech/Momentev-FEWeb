"use client";

import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { CircleUserIcon, FileText, Menu, Search } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdown } from "../UserDropdown";
import type { UserProfile } from "@/types/auth";
import type { ServiceCategory } from "@/types/service";

import type { AuthIntent } from "./types";

type ComplexHeaderProps = {
  isUserLoading: boolean;
  user?: UserProfile;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onSearch: () => void;
  userLat?: number | null;
  userLong?: number | null;
  locationSelector: React.ReactNode;
  onOpenMobileMenu: () => void;
  onOpenAuthModal: (intent: AuthIntent) => void;
  isSearchRoute: boolean;
  isCategoriesLoading: boolean;
  categories: ServiceCategory[];
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
  slideContainerRef: React.RefObject<HTMLDivElement | null>;
  x: MotionValue<number>;
  width: number;
  leftOpacity: MotionValue<number>;
  rightOpacity: MotionValue<number>;
};

export function ComplexHeader({
  isUserLoading,
  user,
  searchQuery,
  onSearchQueryChange,
  onSearchKeyDown,
  onSearch,
  userLat,
  userLong,
  locationSelector,
  onOpenMobileMenu,
  onOpenAuthModal,
  isSearchRoute,
  isCategoriesLoading,
  categories,
  selectedCategory,
  onCategoryClick,
  slideContainerRef,
  x,
  width,
  leftOpacity,
  rightOpacity,
}: ComplexHeaderProps) {
  return (
    <header
      className="bg-background fixed top-0 left-0 right-0 w-full shadow-sm z-50 border-b animate-in fade-in slide-in-from-top-5 duration-300"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        <Logo />

        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
          <div className="flex items-center h-12 w-full rounded-lg border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <div className="flex items-center gap-2 flex-1 px-4 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search vendors..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent placeholder:text-muted-foreground"
              />
            </div>

            <div className="w-px h-6 bg-border" />

            {locationSelector}

            <Button
              onClick={onSearch}
              className="rounded-l-none rounded-r-lg px-6 min-w-40 border-none h-full"
            >
              {userLat && userLong ? "Apply" : "Find"}
            </Button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isUserLoading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-36" />
            </>
          ) : (
            <>
              {(!user || user.role === "CUSTOMER") && (
                !user ? (
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => onOpenAuthModal("post-request")}
                  >
                    <FileText className="w-4 h-4" />
                    Post A Request
                  </Button>
                ) : (
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link href="/client/custom-request">
                      <FileText className="w-4 h-4" />
                      Post A Request
                    </Link>
                  </Button>
                )
              )}
              {user ? (
                <UserDropdown user={user} />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => onOpenAuthModal("sign-in")}
                  >
                    <CircleUserIcon className="w-4 h-4" />
                    Sign in
                  </Button>
                  <Button onClick={() => onOpenAuthModal("list-business")}>
                    List your Business
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-w-11 min-h-11"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {isSearchRoute && (
        <div className="backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-300 mx-auto">
              <div
                className="flex items-center justify-center gap-2 py-3"
                suppressHydrationWarning
              >
                {isCategoriesLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-8 w-24 rounded-full shrink-0"
                    />
                  ))
                ) : (
                  <div
                    ref={slideContainerRef}
                    className="overflow-hidden cursor-grab active:cursor-grabbing w-full relative"
                  >
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-40 bg-linear-to-r from-background via-background/50 to-transparent z-10 pointer-events-none"
                      style={{ opacity: leftOpacity }}
                    />

                    <motion.div
                      className="absolute right-0 top-0 bottom-0 w-40 bg-linear-to-l from-background via-background/50 to-transparent z-10 pointer-events-none"
                      style={{ opacity: rightOpacity }}
                    />

                    <motion.div
                      drag="x"
                      dragConstraints={{ right: 0, left: -width }}
                      style={{ x }}
                      className="flex gap-2 w-fit"
                    >
                      {categories.map((category) => {
                        const isActive = selectedCategory === category._id;
                        return (
                          <button
                            key={category._id}
                            onClick={() => onCategoryClick(category._id)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border shrink-0 ${isActive
                              ? "bg-primary/10 text-primary border-primary/20 font-medium"
                              : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                              }`}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
