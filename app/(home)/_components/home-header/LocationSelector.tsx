"use client";

import { ChevronDown, Loader2, MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

type LocationSelectorProps = {
  isMobile?: boolean;
  isLocating: boolean;
  userLat?: number | null;
  userLong?: number | null;
  selectedRadius: number;
  locationLabel: string;
  onGetLocation: () => void;
  onSelectRadius: (radius: number) => void;
  onClearLocation: () => void;
};

export function LocationSelector({
  isMobile = false,
  isLocating,
  userLat,
  userLong,
  selectedRadius,
  locationLabel,
  onGetLocation,
  onSelectRadius,
  onClearLocation,
}: LocationSelectorProps) {
  return (
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
          onClick={onGetLocation}
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
                onClick={() => onSelectRadius(option.value)}
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
              onClick={onClearLocation}
              className="text-muted-foreground"
            >
              Clear location
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
