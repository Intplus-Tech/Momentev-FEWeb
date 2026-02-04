"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect } from "react";

const VENDOR_CATEGORIES = {
  "Photography & Videography": [
    "Wedding Photographer",
    "Videographer",
    "Photo Booth",
    "Drone Photography",
    "Live Streaming",
  ],
  "Catering & Beverages": [
    "Wedding Caterer",
    "Bartending Service",
    "Cake Baker",
    "Coffee Cart",
    "Ice Cream Truck",
  ],
  Entertainment: [
    "DJ",
    "Live Band",
    "String Quartet",
    "Magician",
    "Caricaturist",
    "Photo booth with Attendant",
  ],
  "Decor & Floral": [
    "Florist",
    "Event Decorator",
    "Lighting Specialist",
    "Balloon Artist",
    "Furniture Rental",
  ],
  Transportation: ["Vintage Car Hire", "Guest Shuttle", "Valet Parking"],
  "Wedding Specific": [
    "Wedding Planner",
    "Officiant",
    "Hair artist",
    "Makeup Artist",
    "Bridal Attire",
    "Invitations & Stationery",
  ],
};

export function VendorNeedsStep() {
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const setVendorNeeds = useCustomRequestStore((state) => state.setVendorNeeds);
  const setIsVendorNeedsValid = useCustomRequestStore(
    (state) => state.setIsVendorNeedsValid,
  );

  const [selectedVendors, setSelectedVendors] = useState<
    Record<string, string[]>
  >(vendorNeeds?.selectedVendors || {});
  const [requirements, setRequirements] = useState<Record<string, string>>(
    vendorNeeds?.specificRequirements || {},
  );

  const selectedCategories = Object.keys(selectedVendors).filter(
    (cat) => selectedVendors[cat]?.length > 0,
  );

  useEffect(() => {
    setIsVendorNeedsValid(selectedCategories.length > 0);
  }, [selectedCategories, setIsVendorNeedsValid]);

  const handleVendorToggle = (category: string, vendor: string) => {
    setSelectedVendors((prev) => {
      const categoryVendors = prev[category] || [];
      const next = categoryVendors.includes(vendor)
        ? categoryVendors.filter((v) => v !== vendor)
        : [...categoryVendors, vendor];

      const newSelectedVendors = {
        ...prev,
        [category]: next,
      };

      // Clean up empty categories
      if (next.length === 0) {
        delete newSelectedVendors[category];
      }

      setVendorNeeds({
        selectedCategories: Object.keys(newSelectedVendors).filter(
          (cat) => newSelectedVendors[cat]?.length > 0,
        ),
        selectedVendors: newSelectedVendors,
        specificRequirements: requirements,
      });

      return newSelectedVendors;
    });
  };

  const handleRequirementChange = (category: string, value: string) => {
    const newRequirements = { ...requirements, [category]: value };
    setRequirements(newRequirements);
    setVendorNeeds({
      selectedCategories,
      selectedVendors,
      specificRequirements: newRequirements,
    });
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Select Vendor Categories */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Select Vendor categories you need
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(VENDOR_CATEGORIES).map(([category, vendors]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {category}:
                </h4>
                <div className="space-y-2">
                  {vendors.map((vendor) => (
                    <label
                      key={vendor}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={
                          selectedVendors[category]?.includes(vendor) || false
                        }
                        onCheckedChange={() =>
                          handleVendorToggle(category, vendor)
                        }
                      />
                      <span className="text-sm">{vendor}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Specific Requirements */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Specific Requirement for Each Vendor
          </span>
        </div>
        <div className="p-4 space-y-4">
          {selectedCategories.length > 0 ? (
            selectedCategories.map((category) => (
              <FloatingLabelInput
                key={category}
                label={category}
                value={requirements[category] || ""}
                onChange={(e) =>
                  handleRequirementChange(category, e.target.value)
                }
              />
            ))
          ) : (
            <>
              {Object.keys(VENDOR_CATEGORIES).map((category) => (
                <FloatingLabelInput
                  key={category}
                  label={category}
                  value={requirements[category] || ""}
                  onChange={(e) =>
                    handleRequirementChange(category, e.target.value)
                  }
                  disabled
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
