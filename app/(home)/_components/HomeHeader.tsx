"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/brand/logo";
import {
  Search,
  MapPin,
  CircleUserIcon,
  Menu,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  PartyPopper,
  Sparkles,
  Music,
  Building2,
  Cake,
  Users,
  Palette,
  Video,
  Car,
  Zap,
} from "lucide-react";

const locations = [
  "East London",
  "West London",
  "Central London",
  "North London",
  "South London",
];

// Category filters
const categories = [
  { id: "photography", label: "Event Photographers", icon: Camera },
  // { id: "venue", label: "Venue Managers", icon: Building2 },
  { id: "caterer", label: "Caterers", icon: Cake },
  { id: "entertainment", label: "DJs / Musicians", icon: Music },
  { id: "planners", label: "Event Planners", icon: Users },
  { id: "videography", label: "Videographers", icon: Video },
  { id: "decorator", label: "Venue Decorators", icon: Sparkles },
  { id: "makeup", label: "Makeup Artists", icon: Palette },
  // { id: "transport", label: "Transportation", icon: Car },
  { id: "technical", label: "Sound & Lighting", icon: Zap },
];

function HomeHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchPage = pathname === "/search";
  const isSearchRoute = pathname.startsWith("/search");
  const isHome = pathname === "/";

  const [selectedLocation, setSelectedLocation] = useState("East London");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("");
    }

    const location = searchParams.get("location");
    if (location) {
      setSelectedLocation(location);
    }

    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
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
      // Transition to complex header after scrolling past roughly the hero height
      const heroHeight = window.innerHeight - 100;
      setIsScrolledPastHero(scrollY > heroHeight);

      // Add blur to simple header after a slight scroll
      setIsScrolledSlightly(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

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

  // Existing handlers
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery);
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedCategory) params.set("category", selectedCategory);

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Toggle: if clicked again, remove it? Or just select it.
    // Usually filters toggle. Let's assume toggle for better UX if the user wants to clear.
    if (selectedCategory === categoryId) {
      params.delete("category");
      setSelectedCategory("");
    } else {
      params.set("category", categoryId);
      setSelectedCategory(categoryId);
    }

    // Preserve other params is handled by initializing with searchParams
    router.push(`/search?${params.toString()}`);
  };

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
            <li>
              <button className="relative px-3 py-2 font-medium group">
                <span className="relative z-10 transition-colors duration-200 group-hover:text-primary">
                  Post A Request
                </span>
                <span className="absolute inset-0 bg-white/0 rounded-lg transition-all duration-200 group-hover:bg-white/10" />
              </button>
            </li>
            <li>
              <Button
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
                asChild
              >
                <Link href="/client/auth/log-in">
                  <CircleUserIcon className="w-4 h-4" />
                  <span className="hidden xl:inline">Sign in/Sign up</span>
                  <span className="xl:hidden">Sign in</span>
                </Link>
              </Button>
            </li>
            <li>
              <Button
                asChild
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Link href="/vendor/auth/sign-up">List your Business</Link>
              </Button>
            </li>
          </ul>

          {/* Mobile Hamburger - Animated */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[9px]" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[9px]" : ""
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
              <li className="w-full max-w-xs">
                <button className="w-full py-3 font-medium text-foreground hover:text-primary transition-colors text-center">
                  Post A Request
                </button>
              </li>
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
              <li className="w-full max-w-xs">
                <Button
                  className="w-full"
                  asChild
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/vendor/auth/sign-up">List your Business</Link>
                </Button>
              </li>
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

        {/* Desktop Search Bar - Hidden on mobile */}
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
            <Button
              onClick={handleSearch}
              className="ml-4 rounded-r-md px-6 min-w-[160px] border-none"
            >
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
                <SheetClose asChild>
                  <Button variant="outline" className="w-full gap-2" asChild>
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

      {/* Category Filter Bar - Only on Search Page */}
      {isSearchRoute && (
        <div className="backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex flex-wrap items-center justify-center gap-2 py-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`flex items-center gap-2 px-2 py-1 xl:py-2 2xl:py-3 xl:px-4 rounded-full text-[10px] xl:text-xs 2xl:text-sm whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5  " />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
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
