"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { fetchServiceSpecialtiesByCategory } from "@/lib/actions/service-categories";
import type { ServiceCategory, ServiceSpecialty } from "@/types/service";

export function VendorNeedsStep() {
  // Read directly from store — no local state mirror
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const setVendorNeeds = useCustomRequestStore((state) => state.setVendorNeeds);
  const setIsVendorNeedsValid = useCustomRequestStore(
    (state) => state.setIsVendorNeedsValid,
  );

  const selectedCategory = vendorNeeds?.selectedCategory || null;
  const selectedSpecialties = vendorNeeds?.selectedSpecialties || [];

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useServiceCategories();

  const categories: ServiceCategory[] = categoriesData?.data?.data ?? [];

  // Fetch specialties for selected category — single query, not useQueries
  const {
    data: specialtiesResponse,
    isLoading: isSpecialtiesLoading,
    isError: isSpecialtiesError,
  } = useQuery({
    queryKey: ["service-specialties", selectedCategory?._id],
    queryFn: async () => {
      if (!selectedCategory?._id) return [];
      const result = await fetchServiceSpecialtiesByCategory(
        selectedCategory._id,
      );
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch specialties");
      }
      return result.data.data;
    },
    enabled: !!selectedCategory?._id,
    staleTime: 1000 * 60 * 30,
  });

  const specialties = (specialtiesResponse as ServiceSpecialty[]) || [];

  // Update validation when selection changes
  useEffect(() => {
    const isValid = !!selectedCategory && selectedSpecialties.length > 0;
    setIsVendorNeedsValid(isValid);
  }, [selectedCategory, selectedSpecialties.length, setIsVendorNeedsValid]);

  const handleCategorySelect = useCallback(
    (category: ServiceCategory) => {
      if (selectedCategory?._id === category._id) return;
      setVendorNeeds({
        selectedCategory: category,
        selectedSpecialties: [], // Reset specialties when category changes
      });
    },
    [selectedCategory?._id, setVendorNeeds],
  );

  const handleSpecialtyToggle = useCallback(
    (specialty: ServiceSpecialty) => {
      const exists = selectedSpecialties.find((s) => s._id === specialty._id);
      const next = exists
        ? selectedSpecialties.filter((s) => s._id !== specialty._id)
        : [...selectedSpecialties, specialty];

      setVendorNeeds({
        selectedCategory,
        selectedSpecialties: next,
      });
    },
    [selectedCategory, selectedSpecialties, setVendorNeeds],
  );

  return (
    <div className="space-y-6">
      {/* Section 1: Select Vendor Category */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Select a Vendor Category (Single Selection)
          </span>
        </div>
        <div className="p-4">
          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : isCategoriesError ? (
            <p className="text-sm text-destructive">
              {categoriesError instanceof Error
                ? categoriesError.message
                : "Failed to load categories"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className={`
                    cursor-pointer p-3 rounded-md border text-sm font-medium transition-colors
                    flex items-center gap-2
                    ${
                      selectedCategory?._id === category._id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-input"
                    }
                  `}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedCategory?._id === category._id
                        ? "border-primary-foreground"
                        : "border-primary"
                    }`}
                  >
                    {selectedCategory?._id === category._id && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Select Specialties */}
      {selectedCategory && (
        <div className="rounded-lg overflow-hidden border border-primary/20 animate-in fade-in slide-in-from-top-2">
          <div className="bg-primary/10 px-4 py-2">
            <span className="text-sm font-semibold text-primary">
              Select Services for {selectedCategory.name}
            </span>
          </div>
          <div className="p-4">
            {isSpecialtiesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : isSpecialtiesError ? (
              <p className="text-sm text-destructive">
                Failed to load services
              </p>
            ) : specialties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No services available for this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialties.map((specialty) => (
                  <label
                    key={specialty._id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSpecialties.some(
                        (s) => s._id === specialty._id,
                      )}
                      onCheckedChange={() => handleSpecialtyToggle(specialty)}
                    />
                    <span className="text-sm">{specialty.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
