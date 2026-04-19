"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Logo from "@/components/brand/logo";
import {
  Search,
  MapPin,
  CircleUserIcon,
  Menu,
  ChevronDown,
  Loader2,
  Navigation,
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { UserDropdown } from "./UserDropdown";
import { useLocation } from "@/hooks/use-location";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCategory } from "@/types/service";
import { logout } from "@/lib/actions/auth";

// Radius options in km
const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

function HomeHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchRoute = pathname.startsWith("/search");
  const isHome = pathname === "/";

  // Location state
  const {
    lat: userLat,
    long: userLong,
    loading: isLocating,
    requestLocation: requestLocationInternal,
    clearLocation: handleClearLocationHook,
    setLocationState,
  } = useLocation();

  const [selectedRadius, setSelectedRadius] = useState(50);
  const [locationLabel, setLocationLabel] = useState("Set location");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetLocation = () => {
    requestLocationInternal();
    // ideally we'd set label on success, but for now we can watch state or just set it
    // The previous code set it on success.
  };

  useEffect(() => {
    if (userLat && userLong) {
      setLocationLabel("My location");
    }
  }, [userLat, userLong]);
  /* Scroll logic */
  const [width, setWidth] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategories();

  // Access the nested data array from the paginated response
  const categories = categoriesData?.data?.data || [];

  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("");
    }

    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery("");
    }

    // Restore location from URL
    const latParam = searchParams.get("lat");
    const longParam = searchParams.get("long");
    const radiusParam = searchParams.get("radius");

    if (latParam && longParam) {
      setLocationState((prev) => ({
        ...prev,
        lat: parseFloat(latParam),
        long: parseFloat(longParam),
      }));
      setLocationLabel("My location");
    }

    if (radiusParam) {
      setSelectedRadius(parseInt(radiusParam, 10));
    }
  }, [searchParams]);

  // State for simple/complex toggle on homepage
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isScrolledSlightly, setIsScrolledSlightly] = useState(false);
  const showSimpleHeader = isHome && !isScrolledPastHero;

  useEffect(() => {
    if (!isHome) {
      setIsScrolledPastHero(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Switch to complex header when hero search scrolls out of view (~40% of viewport)
      const searchOutOfView = window.innerHeight * 0.4;
      setIsScrolledPastHero(scrollY > searchOutOfView);
      setIsScrolledSlightly(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, -20], [0, 1]);
  const rightOpacity = useTransform(x, [-width + 20, -width], [1, 0]);

  useEffect(() => {
    if (slideContainerRef.current) {
      // Calculate the draggable constraint based on difference between content width and container width
      const scrollWidth = slideContainerRef.current.scrollWidth;
      const offsetWidth = slideContainerRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, [categoriesData]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Clear location
  const handleClearLocation = () => {
    handleClearLocationHook();
    setLocationLabel("Set location");
  };

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    // Add geolocation params if available
    if (userLat && userLong) {
      params.set("lat", userLat.toString());
      params.set("long", userLong.toString());
      params.set("radius", selectedRadius.toString());
      params.set("sort", "distance"); // Auto-set sort to distance for nearby
    }

    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory === categoryId) {
      params.delete("category");
      setSelectedCategory("");
    } else {
      params.set("category", categoryId);
      setSelectedCategory(categoryId);
    }
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  // Auth helpers for mobile menu inline navigation
  const isVendor = user?.role === "VENDOR";
  const dashboardLink = isVendor ? "/vendor/dashboard" : "/client/dashboard";
  const settingsLink = isVendor ? "/vendor/settings" : "/client/settings";
  const messagesLink = isVendor ? "/vendor/messages" : "/client/messages";

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  // Location dropdown content
  const LocationSelector = ({ isMobile = false }: { isMobile?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isMobile ? "outline" : "ghost"}
          className={
            isMobile
              ? "w-full justify-between font-normal"
              : "h-auto py-2 px-3 gap-1.5 rounded-none hover:bg-muted/50 font-normal text-sm"
          }
        >
          <span className="flex items-center gap-2">
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={isMobile ? "" : "hidden lg:inline"}>
              {isLocating
                ? "Locating..."
                : userLat && userLong
                  ? `My location (${selectedRadius} km)`
                  : locationLabel}
            </span>
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-50">
        <DropdownMenuItem
          onClick={handleGetLocation}
          disabled={isLocating}
          className="gap-2"
        >
          <Navigation className="w-4 h-4" />
          Use my location
        </DropdownMenuItem>

        {userLat && userLong && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Search radius
            </div>
            {radiusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSelectedRadius(option.value)}
                className={
                  selectedRadius === option.value
                    ? "bg-primary/10 text-primary font-medium"
                    : ""
                }
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClearLocation}
              className="text-muted-foreground"
            >
              Clear location
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // --- RENDER ---
  return (
    <>
      {showSimpleHeader ? (
        /* ---- SIMPLE HEADER (Transparent, Home Hero) ---- */
        <nav
          className={`fixed top-4 2xl:max-w-7xl max-w-[80%] mx-auto rounded-full left-0 right-0 z-50 transition-colors duration-300 ${isScrolledSlightly
            ? "bg-black/45 backdrop-blur-md"
            : "bg-black/30 backdrop-blur-sm"
            }`}
        // style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between relative">
            <Logo variant="mixed" className="text-white shrink-0" />

            {/* Desktop center nav link */}
            <div className="flex items-center gap-3 xl:gap-4">
              <div className="hidden lg:flex items-center">
                {isUserLoading ? (
                  <Skeleton className="h-8 w-28 bg-white/20" />
                ) : (
                  (!user || user.role === "CUSTOMER") && (
                    <Button
                      asChild
                      variant={"link"}
                    >
                      <Link
                        href="/client/custom-request"
                        className="text-sm text-white/95 hover:text-white transition-colors duration-200"
                      >
                        Post A Request
                      </Link>
                    </Button>
                  )
                )}
              </div>

              {/* Desktop right actions */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4 text-white">
                {isUserLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 bg-white/20" />
                    <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
                  </>
                ) : user ? (
                  <UserDropdown user={user} />
                ) : (
                  <>
                    <Button
                      asChild
                      variant={'ghost'}
                      size={"lg"}
                      className="transition-colors duration-200 bg-white/15 px-4"
                    >
                      <Link
                        href="/client/auth/log-in"
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size={"lg"}
                      className="rounded-l-md rounded-r-4xl pr-4"
                    >
                      <Link href="/vendor/auth/sign-up">List Your Business</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </nav>
      ) : (
        /* ---- COMPLEX HEADER (Search & Filters) ---- */
        <header
          className="bg-background fixed top-0 left-0 right-0 w-full shadow-sm z-50 border-b animate-in fade-in slide-in-from-top-5 duration-300"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Main Header Row */}
          <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
            {/* Logo */}
            <Logo />

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
              <div className="flex items-center h-12 w-full rounded-lg border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                {/* Search Input */}
                <div className="flex items-center gap-2 flex-1 px-4 py-2">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search vendors..."
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent placeholder:text-muted-foreground"
                  />
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-border" />

                {/* Location Selector */}
                <LocationSelector />

                {/* Find Button */}
                <Button
                  onClick={handleSearch}
                  className="rounded-l-none rounded-r-lg px-6 min-w-40 border-none h-full"
                >
                  {userLat && userLong ? "Apply" : "Find"}
                </Button>
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {isUserLoading ? (
                <>
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-36" />
                </>
              ) : (
                <>
                  {(!user || user.role === "CUSTOMER") && (
                    <Button variant="ghost" className="gap-2" asChild>
                      <Link href="/client/custom-request">
                        <FileText className="w-4 h-4" />
                        Post A Request
                      </Link>
                    </Button>
                  )}
                  {user ? (
                    <UserDropdown user={user} />
                  ) : (
                    <>
                      <Button variant="ghost" className="gap-2" asChild>
                        <Link href="/client/auth/log-in">
                          <CircleUserIcon className="w-4 h-4" />
                          Sign in
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/vendor/auth/sign-up">
                          List your Business
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden min-w-11 min-h-11"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Filter Bar - Only on Search Route */}
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
                      /* Scrollable Container */
                      <div
                        ref={slideContainerRef}
                        className="overflow-hidden cursor-grab active:cursor-grabbing w-full relative"
                      >
                        {/* Left Gradient Indicator */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-40 bg-linear-to-r from-background via-background/50 to-transparent z-10 pointer-events-none"
                          style={{ opacity: leftOpacity }}
                        />

                        {/* Right Gradient Indicator */}
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
                          {categories.map((category: ServiceCategory) => {
                            const isActive = selectedCategory === category._id;
                            return (
                              <button
                                key={category._id}
                                onClick={() =>
                                  handleCategoryClick(category._id)
                                }
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
      )}

      {/* ---- Unified Mobile Menu Sheet ---- */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
            {/* Mobile Search */}
            <div className="p-6 space-y-4 border-b">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-lg border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                      setMobileMenuOpen(false);
                    }
                  }}
                  placeholder="Find a vendor..."
                  className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-0 text-sm bg-transparent"
                />
              </div>

              <LocationSelector isMobile />

              {userLat && userLong && (
                <p className="text-xs text-muted-foreground">
                  Searching within {selectedRadius} km
                </p>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  handleSearch();
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Vendors
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
              {(!user || user?.role === "CUSTOMER") && (
                <Link
                  href="/client/custom-request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Post A Request
                </Link>
              )}
            </nav>

            {/* Account Section */}
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
                  {/* User info card */}
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
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                  <Link
                    href={messagesLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    Messages
                  </Link>
                  <Link
                    href={settingsLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </Link>

                  <Separator className="my-2" />

                  <button
                    onClick={handleLogout}
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
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/client/auth/log-in">
                      <CircleUserIcon className="w-4 h-4" />
                      Sign in / Sign up
                    </Link>
                  </Button>
                  <Button
                    className="w-full"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/vendor/auth/sign-up">List your Business</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function HomeHeader() {
  return (
    <Suspense
      fallback={<div className="h-20 w-full fixed top-0 bg-transparent" />}
    >
      <HomeHeaderContent />
    </Suspense>
  );
}
