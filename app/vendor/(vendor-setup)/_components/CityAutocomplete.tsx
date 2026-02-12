"use client";

import * as React from "react";
import { ukCities, type UKCity } from "../_data/uk-cities";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

interface CityAutocompleteProps {
  onLocationSelect: (location: UKCity) => void;
  placeholder?: string;
}

export function CityAutocomplete({
  onLocationSelect,
  placeholder = "Search for a city...",
}: CityAutocompleteProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Filter cities based on query
  const filteredCities =
    query === ""
      ? []
      : ukCities.filter((city) =>
          city.city.toLowerCase().includes(query.toLowerCase()),
        );

  const handleSelect = (city: UKCity) => {
    onLocationSelect(city);
    setQuery(""); // Clear after select? or keep? usually keep or clear. form clears it.
    setOpen(false);
  };

  // Allow custom entry handling?
  // If the user hits enter on a custom value, we could conceptually support it.
  // But for now, let's Stick to list selection as primary, and if they type something custom,
  // maybe we can add a "Use 'X'" option.

  return (
    <div className="relative w-full">
      <Combobox open={open} onOpenChange={setOpen}>
        <div className="relative">
          <ComboboxInput
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <ComboboxContent className="max-h-[200px] overflow-y-auto">
          {filteredCities.length === 0 && query.length > 0 && (
            // Allow selecting the custom query as a city
            <ComboboxList>
              <ComboboxItem
                className="cursor-pointer py-3 text-center justify-center font-medium"
                onSelect={() =>
                  handleSelect({
                    city: query,
                    state: query,
                    country: "United Kingdom",
                  })
                }
                onClick={() =>
                  handleSelect({
                    city: query,
                    state: query,
                    country: "United Kingdom",
                  })
                }
              >
                Use "{query}"
              </ComboboxItem>
            </ComboboxList>
          )}

          {filteredCities.length > 0 && (
            <ComboboxList>
              {filteredCities.map((city) => (
                <ComboboxItem
                  key={`${city.city}-${city.state}`}
                  className="cursor-pointer"
                  onClick={() => handleSelect(city)}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{city.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {city.state}
                    </span>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
