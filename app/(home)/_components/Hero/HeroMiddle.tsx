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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  ChevronDown,
  X,
  Navigation,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { ServiceCategory } from "@/types/service";

// Radius options in km
const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

// Fallback services for typewriter effect
const fallbackServices = [
  "Makeup Artists",
  "Caterers",
  "Photographers",
  "DJs",
  "Decorators",
];

interface HeroMiddleProps {
  onServiceChange?: (index: number) => void;
}

export default function HeroMiddle({ onServiceChange }: HeroMiddleProps) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Location state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Set location");

  const router = useRouter();

  // Fetch categories from backend
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategories();
  // Access the nested data array from the paginated response
  const categories: ServiceCategory[] = categoriesData?.data?.data || [];

  // Use category names for typewriter effect
  const services =
    categories.length > 0
      ? categories.slice(0, 5).map((c) => c.name)
      : fallbackServices;

  // Notify parent when service index changes
  useEffect(() => {
    onServiceChange?.(currentServiceIndex);
  }, [currentServiceIndex, onServiceChange]);

  // Typewriter effect
  useEffect(() => {
    const currentService = services[currentServiceIndex] || "Vendors";
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseDuration = 2000;

    if (!isDeleting && displayText === currentService) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentService.substring(0, displayText.length - 1));
      } else {
        setDisplayText(currentService.substring(0, displayText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentServiceIndex, services]);

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

  return (
    <section className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-5xl w-full mx-auto text-center space-y-6 md:space-y-4">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          <span>Book Trusted</span> <br className="md:hidden" />
          <span className="text-yellow-400 underline underline-offset-4 decoration-2">
            {displayText}
          </span>{" "}
          <br className="md:hidden" />
          In Minutes.
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-sm sm:text-base lg:text-lg px-4 max-w-3xl mx-auto">
          Discover, compare, and secure caterers, photographers, and more—all in
          one place.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row bg-white shadow-lg overflow-visible">
            {/* Search input */}
            <div className="relative flex-1">
              <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                <Search className="shrink-0 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Find a vendor for your event"
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-1 text-sm md:text-base placeholder:text-gray-400"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Divider for desktop */}
            <div className="hidden sm:block w-px bg-gray-100" />

            {/* Location dropdown + Find button */}
            <div className="flex items-center gap-3 px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto py-1.5 px-2 gap-2 hover:bg-gray-50 font-normal"
                  >
                    {isLocating ? (
                      <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm md:text-base whitespace-nowrap">
                      {isLocating ? "Locating..." : locationLabel}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px]">
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

              <Button
                onClick={handleSearch}
                className="flex-1 sm:flex-none sm:px-6 min-w-34"
              >
                Find
              </Button>
            </div>
          </div>
        </div>

        {/* Browse text */}
        <p className="text-white text-sm sm:text-base">
          or Browse Featured Category
        </p>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
          {isCategoriesLoading
            ? // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-28 rounded-full bg-white/20"
                />
              ))
            : categories.slice(0, 4).map((category) => (
                <Button
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className="bg-black/10 hover:bg-black/50 backdrop-blur-sm py-2 px-4 sm:px-5 rounded-full text-xs sm:text-sm text-white transition-colors"
                >
                  {category.name.split(" ")[0]}
                </Button>
              ))}
        </div>
      </div>
    </section>
  );
}
