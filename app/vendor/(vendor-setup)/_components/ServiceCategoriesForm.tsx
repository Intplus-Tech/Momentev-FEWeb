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
import { X } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";

const SERVICE_CATEGORIES = [
  { value: "photography", label: "Photography & Videography" },
  { value: "catering", label: "Catering & Beverages" },
  { value: "decoration", label: "Decoration & Design" },
  { value: "entertainment", label: "Entertainment & Music" },
  { value: "venue", label: "Venue & Spaces" },
];

// Category-based specialties
const SPECIALTIES_BY_CATEGORY: Record<
  string,
  Array<{ id: string; label: string }>
> = {
  photography: [
    { id: "wedding-photography", label: "Wedding Photography" },
    { id: "engagement-sessions", label: "Engagement Sessions" },
    { id: "corporate-events", label: "Corporate Events Photography" },
    { id: "family-portraits", label: "Family Portraits" },
    { id: "event-videography", label: "Event Videography" },
    { id: "drone-photography", label: "Drone Photography" },
  ],
  catering: [
    { id: "wedding-catering", label: "Wedding catering" },
    { id: "concession-catering", label: "Concession catering" },
    { id: "social-event-catering", label: "Social Event catering" },
    { id: "outdoor-catering", label: "Outdoor catering" },
    { id: "corporate-catering", label: "Corporate catering" },
    { id: "private-events", label: "Private Events" },
  ],
  decoration: [
    { id: "wedding-decoration", label: "Wedding Decoration" },
    { id: "event-styling", label: "Event Styling" },
    { id: "floral-arrangements", label: "Floral Arrangements" },
    { id: "balloon-decoration", label: "Balloon Decoration" },
    { id: "lighting-design", label: "Lighting Design" },
    { id: "theme-parties", label: "Theme Parties" },
  ],
  entertainment: [
    { id: "live-band", label: "Live Band" },
    { id: "dj-services", label: "DJ Services" },
    { id: "mc-host", label: "MC/Host" },
    { id: "dancers", label: "Dancers" },
    { id: "magician", label: "Magician" },
    { id: "comedian", label: "Comedian" },
  ],
  venue: [
    { id: "wedding-venue", label: "Wedding Venue" },
    { id: "conference-hall", label: "Conference Hall" },
    { id: "outdoor-space", label: "Outdoor Space" },
    { id: "banquet-hall", label: "Banquet Hall" },
    { id: "garden-venue", label: "Garden Venue" },
    { id: "rooftop-venue", label: "Rooftop Venue" },
  ],
};

const MINIMUM_BOOKING_DURATION = [
  { value: "2-hours", label: "2 hours" },
  { value: "1-hour", label: "1 hour" },
  { value: "4-hours", label: "4 hours" },
  { value: "full-day", label: "Full day" },
];

const LEAD_TIME_REQUIRED = [
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-week", label: "1 Week" },
  { value: "4-weeks", label: "4 Weeks" },
  { value: "flexible", label: "Flexible" },
];

const MAXIMUM_EVENT_SIZE = [
  { value: "unlimited", label: "Unlimited" },
  { value: "50-guests", label: "50 guests" },
  { value: "100-guests", label: "100 guests" },
  { value: "200-guests", label: "200 guests" },
];

export function ServiceCategoriesForm() {
  const [keywordInput, setKeywordInput] = useState("");
  const {
    serviceCategories,
    updateServiceCategories,
    setServiceCategoriesValid,
  } = useBusinessSetup();

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

  // Get specialties for selected category
  const availableSpecialties = selectedCategory
    ? SPECIALTIES_BY_CATEGORY[selectedCategory] || []
    : [];

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
      console.log(
        "Loading service categories from context:",
        serviceCategories,
      );
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
      console.log("📝 Updating service categories in context:", formData);
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
          <Controller
            name="serviceCategory"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Primary Service Category"
                options={SERVICE_CATEGORIES}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.serviceCategory?.message}
              />
            )}
          />
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
            <Input
              placeholder="Add keywords (press Enter)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
            />
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
