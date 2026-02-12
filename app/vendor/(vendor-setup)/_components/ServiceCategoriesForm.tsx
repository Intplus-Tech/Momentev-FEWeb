"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceCategoriesSchema,
  type ServiceCategoriesFormData,
} from "../_schemas/serviceCategoriesSchema";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import {
  useServiceCategories,
  useServiceSpecialties,
  useSuggestedTags,
} from "@/hooks/api/use-service-categories";

// Removed hardcoded SERVICE_CATEGORIES and SPECIALTIES_BY_CATEGORY
// Now fetched from API via TanStack Query hooks

const MINIMUM_BOOKING_DURATION = [
  { value: "two_hours", label: "2 hours" },
  { value: "an_hour", label: "1 hour" },
  { value: "four_hours", label: "4 hours" },
  { value: "full_day", label: "Full day" },
];

const LEAD_TIME_REQUIRED = [
  { value: "two_weeks", label: "2 Weeks" },
  { value: "a_week", label: "1 Week" },
  { value: "four_weeks", label: "4 Weeks" },
  { value: "flexible", label: "Flexible" },
];

const MAXIMUM_EVENT_SIZE = [
  { value: "unlimited", label: "Unlimited" },
  { value: "fifty_guest", label: "50 guests" },
  { value: "hundred_guest", label: "100 guests" },
  { value: "two_hundred_guest", label: "200 guests" },
];

export function ServiceCategoriesForm() {
  const [keywordInput, setKeywordInput] = useState("");

  // Fetch categories and specialties from API
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useServiceCategories();

  // Zustand selective subscriptions
  const serviceCategories = useVendorSetupStore(
    (state) => state.serviceCategories,
  );
  const updateServiceCategories = useVendorSetupStore(
    (state) => state.updateServiceCategories,
  );
  const setServiceCategoriesValid = useVendorSetupStore(
    (state) => state.setServiceCategoriesValid,
  );

  const isUpdatingFromContext = useRef(false);
  const hasLoadedInitialData = useRef(false);
  const isMounted = useRef(true);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ServiceCategoriesFormData>({
    resolver: zodResolver(serviceCategoriesSchema),
    mode: "onChange",
    defaultValues: {
      serviceCategory: "",
      specialties: [],
      minimumBookingDuration: "",
      leadTimeRequired: "",
      maximumEventSize: "",
      keywords: [],
    },
  });

  const keywords = watch("keywords") || [];
  const selectedSpecialties = watch("specialties") || [];
  const selectedCategory = watch("serviceCategory");

  // Fetch specialties when category is selected
  const {
    data: specialtiesData,
    isLoading: isLoadingSpecialties,
    isError: isSpecialtiesError,
    error: specialtiesError,
  } = useServiceSpecialties(selectedCategory || null);

  // Fetch suggested tags when category is selected
  const {
    data: suggestedTagsData,
    isError: isSuggestedTagsError,
    error: suggestedTagsError,
  } = useSuggestedTags(selectedCategory || null);

  // Transform API data to dropdown format
  const categories =
    categoriesData?.data?.data?.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  const availableSpecialties =
    specialtiesData?.data?.map((spec) => ({
      id: spec._id,
      label: spec.name,
    })) || [];

  // Get suggested tags
  const suggestedTags = suggestedTagsData?.data?.tags || [];

  // Handler for adding a tag from suggested tags
  const handleAddTag = (tag: string) => {
    if (!keywords.includes(tag)) {
      setValue("keywords", [...keywords, tag]);
    }
  };

  // Reset specialties when category changes
  React.useEffect(() => {
    if (selectedCategory && selectedSpecialties.length > 0) {
      const validSpecialties = selectedSpecialties.filter((id) =>
        availableSpecialties.some((spec) => spec.id === id),
      );
      if (validSpecialties.length !== selectedSpecialties.length) {
        setValue("specialties", validSpecialties, { shouldValidate: true });
      }
    }
  }, [selectedCategory, availableSpecialties]);

  // Load from context on mount
  useEffect(() => {
    if (serviceCategories && !hasLoadedInitialData.current) {
      isUpdatingFromContext.current = true;

      reset(serviceCategories as ServiceCategoriesFormData, {
        keepDefaultValues: false,
      });
      hasLoadedInitialData.current = true;
      setFormKey((prev) => prev + 1);
      setTimeout(() => {
        if (isMounted.current) {
          isUpdatingFromContext.current = false;
        }
      }, 100);
    }
  }, [serviceCategories, reset]);

  // Watch all fields and update context
  useEffect(() => {
    if (isUpdatingFromContext.current) return;

    const subscription = watch((formData) => {
      updateServiceCategories(formData as Partial<ServiceCategoriesFormData>);
    });

    return () => subscription.unsubscribe();
  }, [watch, updateServiceCategories]);

  // Update validation status
  useEffect(() => {
    setServiceCategoriesValid(isValid);
  }, [isValid, setServiceCategoriesValid]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setValue("keywords", [...keywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setValue(
      "keywords",
      keywords.filter((k) => k !== keyword),
    );
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    const newSpecialties = selectedSpecialties.includes(specialtyId)
      ? selectedSpecialties.filter((id) => id !== specialtyId)
      : [...selectedSpecialties, specialtyId];
    setValue("specialties", newSpecialties, { shouldValidate: true });
  };

  return (
    <div key={formKey} className="space-y-6 px-6">
      {/* What Do You Offer Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">What Do You Offer?</h3>
        </div>

        <div className="space-y-4">
          {categoriesError && (
            <p className="text-xs text-destructive">
              Failed to load categories. Please try again.
            </p>
          )}
          <Controller
            name="serviceCategory"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Primary Service Category"
                options={categories}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.serviceCategory?.message}
                disabled={isLoadingCategories}
              />
            )}
          />
          {isLoadingCategories && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories...
            </div>
          )}
        </div>
      </div>

      {/* Specialties Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Specialties*</h3>
        </div>

        {!selectedCategory ? (
          <p className="text-sm text-muted-foreground">
            Please select a service category first
          </p>
        ) : isLoadingSpecialties ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading specialties...
          </div>
        ) : isSpecialtiesError ? (
          <p className="text-sm text-destructive">
            {specialtiesError instanceof Error
              ? specialtiesError.message
              : "Failed to load specialties"}
          </p>
        ) : availableSpecialties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No specialties available for this category
          </p>
        ) : (
          <div className="space-y-3">
            {availableSpecialties.map((specialty) => (
              <div key={specialty.id} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty.id}
                  checked={selectedSpecialties.includes(specialty.id)}
                  onCheckedChange={() => handleSpecialtyToggle(specialty.id)}
                />
                <label
                  htmlFor={specialty.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {specialty.label}
                </label>
              </div>
            ))}
          </div>
        )}
        {errors.specialties && (
          <p className="text-xs text-destructive mt-1">
            {errors.specialties.message}
          </p>
        )}
      </div>

      {/* Service Details Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Service Details</h3>
        </div>

        <div className="space-y-4">
          <Controller
            name="minimumBookingDuration"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Minimum Booking Duration"
                options={MINIMUM_BOOKING_DURATION}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.minimumBookingDuration?.message}
              />
            )}
          />

          <Controller
            name="leadTimeRequired"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Lead Time Required"
                options={LEAD_TIME_REQUIRED}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.leadTimeRequired?.message}
              />
            )}
          />

          <Controller
            name="maximumEventSize"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Maximum Event Size"
                options={MAXIMUM_EVENT_SIZE}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.maximumEventSize?.message}
              />
            )}
          />

          <div className="space-y-3 mb-2">
            {/* Show suggested tags if category is selected */}
            {selectedCategory && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Suggested Keywords (click to add)
                </label>
                {isSuggestedTagsError ? (
                  <p className="text-xs text-destructive">
                    {suggestedTagsError instanceof Error
                      ? suggestedTagsError.message
                      : "Failed to load suggested tags"}
                  </p>
                ) : suggestedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        disabled={keywords.includes(tag)}
                        className="px-3 py-1 text-sm border border-primary/30 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary/10"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Manual keyword input */}
            <Input
              placeholder="Add custom keywords (press Enter)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
            />

            {/* Selected keywords */}
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
