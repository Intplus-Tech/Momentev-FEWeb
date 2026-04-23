"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MapPin,
  ChevronDown,
  X,
  Navigation,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { useSearchSuggestions } from "@/hooks/api/use-search-suggestions";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { addRecentSearch } from "@/lib/search/recent-searches";
import { ServiceCategory } from "@/types/service";
import { AuthChoiceModal } from "../home-header/AuthChoiceModal";
import type { AuthMode, AuthRole } from "../home-header/types";

// Radius options in km
const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

export default function HeroMiddle() {
  const [showSearch, setShowSearch] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedAuthRole, setSelectedAuthRole] = useState<AuthRole | null>(
    "CLIENT",
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Location state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Set location");

  const router = useRouter();
  const { data: user } = useUserProfile();

  // Fetch categories from backend
  const { data: categoriesData } = useServiceCategories();
  // Access the nested data array from the paginated response
  const categories: ServiceCategory[] = categoriesData?.data?.data || [];
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    refreshRecentSearches,
  } = useSearchSuggestions(searchQuery);

  // Request user's geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLong(position.coords.longitude);
        setLocationLabel("My location");
        setIsLocating(false);
        toast.success("Location set", {
          description: "We'll show vendors near you.",
        });
      },
      (error) => {
        setIsLocating(false);
        let message = "Could not get your location";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location access denied. Please enable it in browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location unavailable";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out";
        }
        toast.error("Location error", { description: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  // Clear location
  const handleClearLocation = () => {
    setUserLat(null);
    setUserLong(null);
    setLocationLabel("Set location");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      refreshRecentSearches();
    }

    setShowSuggestions(false);
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    // Add geolocation params if available
    if (userLat && userLong) {
      params.set("lat", userLat.toString());
      params.set("long", userLong.toString());
      params.set("radius", selectedRadius.toString());
      params.set("sort", "distance");
    }

    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionSelect = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) {
      return;
    }

    setSearchQuery(nextQuery);
    addRecentSearch(nextQuery);
    refreshRecentSearches();
    setShowSuggestions(false);

    const params = new URLSearchParams();
    params.set("q", nextQuery);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams();
    params.set("category", categoryId);

    // Include location if set
    if (userLat && userLong) {
      params.set("lat", userLat.toString());
      params.set("long", userLong.toString());
      params.set("radius", selectedRadius.toString());
      params.set("sort", "distance");
    }

    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const openPostRequestFlow = () => {
    if (user) {
      router.push("/client/custom-request");
      return;
    }

    setSelectedAuthRole("CLIENT");
    setAuthModalOpen(true);
  };

  const getAuthPath = (role: AuthRole, mode: AuthMode) => {
    if (role === "VENDOR") {
      return mode === "sign-in" ? "/vendor/auth/log-in" : "/vendor/auth/sign-up";
    }

    return mode === "sign-in" ? "/client/auth/log-in" : "/client/auth/sign-up";
  };

  const handleAuthAction = (mode: AuthMode) => {
    if (!selectedAuthRole) {
      return;
    }

    setAuthModalOpen(false);
    router.push(getAuthPath(selectedAuthRole, mode));
  };

  return (
    <>
      <section className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-5xl w-full mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">
            <span className="bg-linear-to-r from-[#f6f2d5] via-[#f3ea8f] to-[#e8ef75] bg-clip-text text-transparent">
              Plan with Confidence.
              <br />
              Grow with Confidence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-sm sm:text-base lg:text-2xl px-4 max-w-3xl mx-auto tracking-wide">
            MOMENTEV connects individuals with rigorously verified vendors, with secure booking and trusted reviews.
          </p>

          <div className="pt-2">
            {!showSearch ? (
              <div className="flex flex-wrap items-center justify-center gap-3 text-white/90">
                <Button
                  onClick={() => setShowSearch(true)}
                  className="h-11 px-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Find Vendor
                </Button>
                <Button
                  variant={"link"}
                  onClick={openPostRequestFlow}
                  className="text-sm sm:text-base text-white hover:text-white underline underline-offset-4"
                >
                  or Let&apos;s find the right vendor for you.
                </Button>
              </div>
            ) : (
              <div id="hero-search-anchor" className="w-full max-w-4xl mx-auto space-y-3">
                <div className="relative">
                  <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-md shadow-2xl overflow-hidden border border-black/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                        <Search className="shrink-0 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => {
                            window.setTimeout(() => setShowSuggestions(false), 120);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                          placeholder="Search..."
                          className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-1 text-sm placeholder:text-gray-400"
                        />
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => setSearchQuery("")}
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full h-full min-h-12 py-2 px-4 rounded-none justify-between font-normal text-gray-600 hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2">
                              {isLocating ? (
                                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                              ) : (
                                <MapPin className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-sm">
                                {isLocating ? "Locating..." : locationLabel}
                              </span>
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-50">
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
                    </div>

                    <Button
                      onClick={handleSearch}
                      className="sm:rounded-none sm:rounded-r-md rounded-none h-12 px-7 bg-blue-600 hover:bg-blue-500"
                    >
                      Search
                    </Button>
                  </div>

                  {showSuggestions && searchQuery.trim().length > 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-md border bg-white text-foreground shadow-lg overflow-hidden">
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
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleSuggestionSelect(suggestion.value);
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

                <p className="text-white/90 text-sm text-center">
                  Not sure what to search for? Let&apos;s{" "}
                  <button
                    type="button"
                    className="text-yellow-300 hover:text-yellow-200 underline underline-offset-2"
                    onClick={() => {
                      if (categories.length > 0) {
                        handleCategoryClick(categories[0]._id);
                      }
                    }}
                  >
                    Post Your Event
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthChoiceModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        selectedAuthRole={selectedAuthRole}
        intent="post-request"
        onSelectRole={setSelectedAuthRole}
        onSignIn={() => handleAuthAction("sign-in")}
        onCreateAccount={() => handleAuthAction("sign-up")}
        onCancel={() => setAuthModalOpen(false)}
      />
    </>
  );
}
