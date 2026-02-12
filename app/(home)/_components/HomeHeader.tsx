"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Logo from "@/components/brand/logo";
import {
  Search,
  MapPin,
  CircleUserIcon,
  Menu,
  ChevronDown,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { UserDropdown } from "./UserDropdown";
import { useLocation } from "@/hooks/use-location";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCategory } from "@/types/service";
import { toast } from "sonner";

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
  const isSearchPage = pathname === "/search";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, [categoriesData, menuOpen]); // Recalculate when data loads or layout changes

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

  // --- SIMPLE HEADER (Transparent) ---
  if (isHome && !isScrolledPastHero) {
    return (
      <>
        <nav
          className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 lg:py-6 z-50 transition-all duration-300 ${
            isScrolledSlightly
              ? "bg-black/20 backdrop-blur-md shadow-sm"
              : "bg-transparent"
          }`}
        >
          <Logo variant="mixed" className="text-white" />

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-white text-sm">
            {isUserLoading ? (
              <>
                <Skeleton className="h-10 w-32 bg-white/20" />
                <Skeleton className="h-10 w-32 bg-white/20" />
              </>
            ) : (
              <>
                {(!user || user.role === "CUSTOMER") && (
                  <li>
                    <button className="relative px-3 py-2 font-medium group">
                      <span className="relative z-10 transition-colors duration-200 group-hover:text-primary">
                        Post A Request
                      </span>
                      <span className="absolute inset-0 bg-white/0 rounded-lg transition-all duration-200 group-hover:bg-white/10" />
                    </button>
                  </li>
                )}

                {user ? (
                  <li>
                    <UserDropdown user={user} />
                  </li>
                ) : (
                  <li>
                    <Button
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
                      asChild
                    >
                      <Link href="/client/auth/log-in">
                        <CircleUserIcon className="w-4 h-4" />
                        <span className="hidden xl:inline">
                          Sign in/Sign up
                        </span>
                        <span className="xl:hidden">Sign in</span>
                      </Link>
                    </Button>
                  </li>
                )}

                {!user && (
                  <li>
                    <Button
                      asChild
                      className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      <Link href="/vendor/auth/sign-up">
                        List your Business
                      </Link>
                    </Button>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-2.25" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-2.25" : ""
                }`}
              />
            </div>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Mobile Menu Content */}
        <div
          className={`fixed top-0 left-0 right-0 bg-white lg:hidden z-40 shadow-2xl transition-all duration-500 ease-out ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
        >
          <div className="pt-20 pb-8 px-6">
            <ul className="flex flex-col items-center gap-4">
              {isUserLoading ? (
                <>
                  <Skeleton className="h-12 w-full max-w-xs" />
                  <Skeleton className="h-12 w-full max-w-xs" />
                </>
              ) : (
                <>
                  {(!user || user.role === "CUSTOMER") && (
                    <li className="w-full max-w-xs">
                      <button className="w-full py-3 font-medium text-foreground hover:text-primary transition-colors text-center">
                        Post A Request
                      </button>
                    </li>
                  )}

                  {user ? (
                    <li className="w-full max-w-xs flex justify-center">
                      <UserDropdown user={user} />
                    </li>
                  ) : (
                    <li className="w-full max-w-xs">
                      <Button
                        className="w-full"
                        variant="outline"
                        asChild
                        onClick={() => setMenuOpen(false)}
                      >
                        <Link href="/client/auth/log-in">
                          <CircleUserIcon className="w-4 h-4" />
                          Sign in/Sign up
                        </Link>
                      </Button>
                    </li>
                  )}

                  {!user && (
                    <li className="w-full max-w-xs">
                      <Button
                        className="w-full"
                        asChild
                        onClick={() => setMenuOpen(false)}
                      >
                        <Link href="/vendor/auth/sign-up">
                          List your Business
                        </Link>
                      </Button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </>
    );
  }

  // --- COMPLEX HEADER (Search & Filters) ---
  return (
    <header className="bg-background fixed top-0 left-0 right-0 w-full shadow-sm z-50 border-b animate-in fade-in slide-in-from-top-5 duration-300">
      {/* Main Header Row */}
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
          <div className="flex items-center h-12 p-0 w-full rounded-md overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 px-4 py-2 focus-within:border-b border-primary">
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
              className="ml-4 rounded-r-md px-6 min-w-40 border-none"
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
          ) : user ? (
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
                <Link href="/vendor/auth/sign-up">List your Business</Link>
              </Button>
            </>
          )}
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
                <LocationSelector isMobile />

                {userLat && userLong && (
                  <div className="text-xs text-muted-foreground">
                    Searching within {selectedRadius} km
                  </div>
                )}
              </div>

              <SheetClose asChild>
                <Button className="w-full" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Find Vendors
                </Button>
              </SheetClose>

              <nav className="space-y-2 mt-auto">
                <Separator />
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Account
                </p>
                {isUserLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : user ? (
                  <div className="flex justify-start">
                    <UserDropdown user={user} />
                  </div>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        asChild
                      >
                        <Link href="/client/auth/log-in">
                          <CircleUserIcon className="w-4 h-4" />
                          Sign in / Sign up
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        <Link href="/vendor/auth/sign-up">
                          List your Business
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category Filter Bar - Only on Search Page */}
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
                      className="absolute right-0 top-0 bottom-0 w-40 bg-linear-to-l from-background  via to-transparent z-10 pointer-events-none"
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
                            onClick={() => handleCategoryClick(category._id)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border shrink-0 ${
                              isActive
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

export default function HomeHeader() {
  return (
    <Suspense
      fallback={<div className="h-20 w-full fixed top-0 bg-transparent" />}
    >
      <HomeHeaderContent />
    </Suspense>
  );
}
