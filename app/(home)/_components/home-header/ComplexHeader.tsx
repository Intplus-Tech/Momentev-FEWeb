"use client";

import Link from "next/link";
import * as React from "react";
import { animate, motion, useMotionValueEvent } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CircleUserIcon,
  FileText,
  Menu,
  Search,
} from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdown } from "../UserDropdown";
import type { UserProfile } from "@/types/auth";
import type { ServiceCategory } from "@/types/service";
import type { SearchSuggestion } from "@/hooks/api/use-search-suggestions";

import type { AuthIntent } from "./types";

type ComplexHeaderProps = {
  isUserLoading: boolean;
  user?: UserProfile;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearch: () => void;
  showSuggestions: boolean;
  isSuggestionsLoading: boolean;
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (value: string) => void;
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
  onSearchFocus,
  onSearchBlur,
  onSearch,
  showSuggestions,
  isSuggestionsLoading,
  suggestions,
  onSuggestionSelect,
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
  const isClient = user?.role === "CUSTOMER" || user?.role === "customer";
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(width > 0);
  const draggedRef = React.useRef(false);

  useMotionValueEvent(x, "change", (latest) => {
    setCanScrollLeft(latest < -1);
    setCanScrollRight(latest > -width + 1);
  });

  React.useEffect(() => {
    const currentX = x.get();
    setCanScrollLeft(currentX < -1);
    setCanScrollRight(width > 0 && currentX > -width + 1);
  }, [width, x]);

  const scrollByAmount = (delta: number) => {
    const current = x.get();
    const target = Math.min(0, Math.max(-width, current + delta));
    animate(x, target, { type: "spring", stiffness: 320, damping: 36 });
  };

  return (
    <header
      className="bg-background fixed top-0 left-0 right-0 w-full shadow-sm z-50 border-b animate-in fade-in slide-in-from-top-5 duration-300"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        <Logo />

        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
          <div className="relative w-full">
            <div className="flex items-center h-12 w-full rounded-lg border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <div className="flex items-center gap-2 flex-1 px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
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

            {showSuggestions && (
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
                          onSuggestionSelect(suggestion.value);
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
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isUserLoading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-36" />
            </>
          ) : (
            <>
              {(!user || isClient) && (
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
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => scrollByAmount(220)}
                      disabled={!canScrollLeft}
                      aria-label="Scroll categories left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

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
                        dragElastic={0.05}
                        dragMomentum={false}
                        style={{ x }}
                        data-category-track="true"
                        className="flex gap-2 w-fit"
                        onDragStart={() => {
                          draggedRef.current = false;
                        }}
                        onDrag={(_, info) => {
                          if (Math.abs(info.offset.x) > 6) {
                            draggedRef.current = true;
                          }
                        }}
                        onDragEnd={() => {
                          window.setTimeout(() => {
                            draggedRef.current = false;
                          }, 0);
                        }}
                      >
                        {categories.map((category) => {
                          const isActive = selectedCategory === category._id;
                          return (
                            <button
                              key={category._id}
                              onClick={(event) => {
                                if (draggedRef.current) {
                                  event.preventDefault();
                                  return;
                                }
                                onCategoryClick(category._id);
                              }}
                              className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border shrink-0 ${isActive
                                ? "bg-primary/10 text-primary border-primary/20 font-medium"
                                : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                                }`}
                            >
                              {isActive && (
                                <motion.span
                                  aria-hidden
                                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent"
                                  animate={{ x: ["-120%", "320%"] }}
                                  transition={{
                                    duration: 1.8,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatDelay: 1.2,
                                  }}
                                />
                              )}
                              <span className="relative z-10">{category.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => scrollByAmount(-220)}
                      disabled={!canScrollRight}
                      aria-label="Scroll categories right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
