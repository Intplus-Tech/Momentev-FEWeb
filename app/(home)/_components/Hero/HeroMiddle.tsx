"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bath,
  Camera,
  Gift,
  Martini,
  Search,
  MapPin,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

// Dummy vendor data
const vendors = [
  {
    id: 1,
    name: "Glamour Makeup Studio",
    category: "Makeup Artists",
    location: "East London",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Sarah's Bridal Makeup",
    category: "Makeup Artists",
    location: "West London",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Divine Catering Co.",
    category: "Caterers",
    location: "East London",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Gourmet Events Catering",
    category: "Caterers",
    location: "Central London",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Tasty Bites Catering",
    category: "Caterers",
    location: "North London",
    rating: 4.6,
  },
  {
    id: 6,
    name: "Lens Masters Photography",
    category: "Photographers",
    location: "East London",
    rating: 5.0,
  },
  {
    id: 7,
    name: "Capture Moments Studio",
    category: "Photographers",
    location: "South London",
    rating: 4.8,
  },
  {
    id: 8,
    name: "DJ Beats Pro",
    category: "DJs",
    location: "Central London",
    rating: 4.9,
  },
  {
    id: 9,
    name: "Party Mix DJ Services",
    category: "DJs",
    location: "East London",
    rating: 4.7,
  },
  {
    id: 10,
    name: "Elegant Decor Studio",
    category: "Decorators",
    location: "West London",
    rating: 4.8,
  },
  {
    id: 11,
    name: "Dream Event Decorators",
    category: "Decorators",
    location: "East London",
    rating: 4.9,
  },
  {
    id: 12,
    name: "Balloon & More",
    category: "Decorators",
    location: "North London",
    rating: 4.5,
  },
];

const locations = [
  "East London",
  "West London",
  "Central London",
  "North London",
  "South London",
];

const services = [
  "Makeup Artists",
  "Caterers",
  "Photographers",
  "DJs",
  "Decorators",
];

const categories = [
  { name: "Birthday Party", icon: Gift, searchTerm: "birthday" },
  { name: "Photography", icon: Camera, searchTerm: "Photographers" },
  { name: "Corporate", icon: Martini, searchTerm: "corporate" },
  { name: "Baby Shower", icon: Bath, searchTerm: "baby shower" },
];

export default function HeroMiddle() {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("East London");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState<typeof vendors>([]);

  // Filter vendors based on search query and location
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVendors([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vendors.filter(
      (vendor) =>
        (vendor.name.toLowerCase().includes(query) ||
          vendor.category.toLowerCase().includes(query)) &&
        vendor.location === selectedLocation
    );
    setFilteredVendors(filtered);
  }, [searchQuery, selectedLocation]);

  // Typewriter effect
  useEffect(() => {
    const currentService = services[currentServiceIndex];
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
  }, [displayText, isDeleting, currentServiceIndex]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery, "in", selectedLocation);
    alert(
      `Searching for "${searchQuery}" in ${selectedLocation}\n\nFound ${filteredVendors.length} vendors`
    );
  };

  const handleCategoryClick = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    setIsSearchOpen(true);
  };

  const handleVendorSelect = (vendorName: string) => {
    setSearchQuery(vendorName);
    setIsSearchOpen(false);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-5xl w-full mx-auto text-center space-y-6 md:space-y-8">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          <span>Book Trusted</span> <br className="md:hidden" />
          <span className="text-yellow-400 underline underline-offset-4 decoration-2">
            {displayText}
          </span>{" "}
          <br className="md:hidden" />
          In Minutes.
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-sm sm:text-base lg:text-lg px-4 max-w-2xl mx-auto">
          Discover, compare, and secure caterers, photographers, and more—all in
          one place.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg overflow-visible">
            {/* Search input with dropdown */}
            <div className="relative flex-1">
              <div className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                <Search className="shrink-0 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setIsSearchOpen(true);
                  }}
                  onFocus={() => searchQuery && setIsSearchOpen(true)}
                  onBlur={(e) => {
                    // Delay closing to allow clicks on dropdown items
                    setTimeout(() => {
                      if (!e.currentTarget.contains(document.activeElement)) {
                        setIsSearchOpen(false);
                      }
                    }, 150);
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
                      setIsSearchOpen(false);
                    }}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>

              {/* Search suggestions dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                  <ScrollArea className="max-h-64">
                    {filteredVendors.length > 0 ? (
                      <>
                        <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/50 font-medium border-b">
                          Vendors in {selectedLocation}
                        </div>
                        {filteredVendors.map((vendor) => (
                          <button
                            key={vendor.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleVendorSelect(vendor.name)}
                            className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {vendor.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {vendor.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <span>★</span>
                                <span>{vendor.rating}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No vendors found for &quot;{searchQuery}&quot; in{" "}
                          {selectedLocation}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Try a different search term or location
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
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
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-sm md:text-base whitespace-nowrap">
                      {selectedLocation}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
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

              <Button
                onClick={handleSearch}
                className="flex-1 sm:flex-none sm:px-6"
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
          {categories.map((category) => (
            <Button
              key={category.name}
              onClick={() => handleCategoryClick(category.searchTerm)}
              className="bg-black/40 hover:bg-black/50 backdrop-blur-sm py-2 px-4 sm:px-5 rounded-full text-xs sm:text-sm text-white flex items-center gap-2 transition-colors border border-white/20"
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
