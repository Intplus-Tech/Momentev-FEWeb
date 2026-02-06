"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { fetchServiceSpecialtiesByCategory } from "@/lib/actions/service-categories";
import type { ServiceCategory, ServiceSpecialty } from "@/types/service";

export function VendorNeedsStep() {
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const setVendorNeeds = useCustomRequestStore((state) => state.setVendorNeeds);
  const setIsVendorNeedsValid = useCustomRequestStore(
    (state) => state.setIsVendorNeedsValid,
  );

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useServiceCategories();

  const categories: ServiceCategory[] = categoriesData?.data?.data ?? [];
  const specialtiesQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["service-specialties", category._id],
      queryFn: async () => {
        const result = await fetchServiceSpecialtiesByCategory(category._id);
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch specialties");
        }
        return result.data.data;
      },
      staleTime: 1000 * 60 * 30,
      enabled: Boolean(category._id),
    })),
  });

  const specialtiesByCategoryName = useMemo(() => {
    const map: Record<string, ServiceSpecialty[]> = {};
    categories.forEach((category, idx) => {
      const data = specialtiesQueries[idx]?.data;
      if (data) {
        map[category.name] = data;
      }
    });
    return map;
  }, [categories, specialtiesQueries]);

  const [selectedVendors, setSelectedVendors] = useState<
    Record<string, string[]>
  >(vendorNeeds?.selectedVendors || {});
  const [requirements, setRequirements] = useState<Record<string, string>>(
    vendorNeeds?.specificRequirements || {},
  );

  const selectedCategories = Object.keys(selectedVendors).filter(
    (cat) => selectedVendors[cat]?.length > 0,
  );

  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((val, idx) => val === b[idx]);

  const recordsEqual = (
    a: Record<string, string[]>,
    b: Record<string, string[]>,
  ) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => {
      if (!b[key]) return false;
      return arraysEqual(a[key], b[key]);
    });
  };

  const requirementsEqual = (
    a: Record<string, string>,
    b: Record<string, string>,
  ) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => a[key] === b[key]);
  };

  useEffect(() => {
    setIsVendorNeedsValid(selectedCategories.length > 0);
  }, [selectedCategories, setIsVendorNeedsValid]);

  // Keep global store in sync without mutating during render
  useEffect(() => {
    const next = {
      selectedCategories,
      selectedVendors,
      specificRequirements: requirements,
    };

    if (
      vendorNeeds &&
      arraysEqual(
        vendorNeeds.selectedCategories || [],
        next.selectedCategories,
      ) &&
      recordsEqual(vendorNeeds.selectedVendors || {}, next.selectedVendors) &&
      requirementsEqual(
        vendorNeeds.specificRequirements || {},
        next.specificRequirements,
      )
    ) {
      return;
    }

    setVendorNeeds(next);
  }, [
    selectedCategories,
    selectedVendors,
    requirements,
    setVendorNeeds,
    vendorNeeds,
  ]);

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

      return newSelectedVendors;
    });
  };

  const handleRequirementChange = (category: string, value: string) => {
    const newRequirements = { ...requirements, [category]: value };
    setRequirements(newRequirements);
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
          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : isCategoriesError ? (
            <p className="text-sm text-rose-600">
              {categoriesError instanceof Error
                ? categoriesError.message
                : "Failed to load categories"}
            </p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const specialties =
                  specialtiesByCategoryName[category.name] || [];
                const activeIdx = categories.findIndex(
                  (c) => c._id === category._id,
                );
                const specialtiesQuery =
                  activeIdx >= 0 ? specialtiesQueries[activeIdx] : undefined;

                return (
                  <div key={category._id} className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      {category.name}:
                    </h4>
                    <div className="space-y-2">
                      {specialtiesQuery?.isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-36" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      ) : specialtiesQuery?.isError ? (
                        <p className="text-sm text-rose-600">
                          {specialtiesQuery.error instanceof Error
                            ? specialtiesQuery.error.message
                            : "Failed to load services"}
                        </p>
                      ) : specialties.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No services available for this category.
                        </p>
                      ) : (
                        specialties.map((specialty) => (
                          <label
                            key={specialty._id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={
                                selectedVendors[category.name]?.includes(
                                  specialty.name,
                                ) || false
                              }
                              onCheckedChange={() =>
                                handleVendorToggle(
                                  category.name,
                                  specialty.name,
                                )
                              }
                            />
                            <span className="text-sm">{specialty.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          {selectedCategories.length > 0
            ? selectedCategories.map((category) => (
                <FloatingLabelInput
                  key={category}
                  label={category}
                  value={requirements[category] || ""}
                  onChange={(e) =>
                    handleRequirementChange(category, e.target.value)
                  }
                />
              ))
            : categories.map((category) => (
                <FloatingLabelInput
                  key={category._id}
                  label={category.name}
                  value={requirements[category.name] || ""}
                  onChange={(e) =>
                    handleRequirementChange(category.name, e.target.value)
                  }
                  disabled
                />
              ))}
        </div>
      </div>
    </div>
  );
}
