"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  businessInfoSchema,
  type BusinessInfoFormData,
  yearsInBusinessOptions,
  businessRegistrationTypeOptions,
  maximumTravelDistanceOptions,
} from "../_schemas/businessInfoSchema";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useState } from "react";

export function BusinessInformationForm() {
  // Zustand selective subscriptions
  const businessInfo = useVendorSetupStore((state) => state.businessInfo);
  const updateBusinessInfo = useVendorSetupStore(
    (state) => state.updateBusinessInfo,
  );
  const setBusinessInfoValid = useVendorSetupStore(
    (state) => state.setBusinessInfoValid,
  );

  const [serviceLocations, setServiceLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const isUpdatingFromContext = useRef(false);
  const [formKey, setFormKey] = useState(0); // Key to force re-render

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      yearsInBusiness: "",
      companyRegistrationNumber: "",
      businessRegistrationType: "",
      businessDescription: "",
      primaryContactName: "",
      emailAddress: "",
      phoneNumber: "",
      meansOfIdentification: "",
      houseNumber: "",
      buildingNumber: "",
      streetAddress: "",
      zipCode: "",
      serviceLocations: [],
      maximumTravelDistance: "",
    },
  });

  const hasLoadedInitialData = useRef(false);
  const isMounted = useRef(true);

  // Load from context when component mounts
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load from context on mount or when businessInfo changes initially
  useEffect(() => {
    if (businessInfo && !hasLoadedInitialData.current) {
      isUpdatingFromContext.current = true;
      console.log("Loading form data from context:", businessInfo);
      // Reset with keepDefaultValues: false to ensure all fields update
      reset(businessInfo as BusinessInfoFormData, {
        keepDefaultValues: false,
      });
      if (businessInfo.serviceLocations) {
        setServiceLocations(businessInfo.serviceLocations);
      }
      hasLoadedInitialData.current = true;
      // Force form re-render
      setFormKey((prev) => prev + 1);
      // Use setTimeout to ensure the flag is reset after all updates
      setTimeout(() => {
        if (isMounted.current) {
          isUpdatingFromContext.current = false;
        }
      }, 100); // Increased timeout to ensure form has re-rendered
    }
  }, [businessInfo, reset]);

  // Update context on form change (only when user changes, not context updates)
  useEffect(() => {
    const subscription = watch((formData) => {
      if (!isUpdatingFromContext.current) {
        console.log("Updating context with form data:", formData);
        updateBusinessInfo(formData as Partial<BusinessInfoFormData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBusinessInfo]);

  // Notify context of validation state
  useEffect(() => {
    setBusinessInfoValid(isValid);
  }, [isValid, setBusinessInfoValid]);

  // Update serviceLocations in form when state changes
  useEffect(() => {
    setValue("serviceLocations", serviceLocations, {
      shouldValidate: true,
    });
  }, [serviceLocations, setValue]);

  const handleAddLocation = () => {
    if (
      locationInput.trim() &&
      !serviceLocations.includes(locationInput.trim())
    ) {
      setServiceLocations([...serviceLocations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const handleRemoveLocation = (location: string) => {
    setServiceLocations(serviceLocations.filter((loc) => loc !== location));
  };

  const handleFormSubmit = async (data: BusinessInfoFormData) => {
    updateBusinessInfo(data);
  };

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Company Information Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4">
          <h3 className="">Company Information</h3>
        </div>

        <div className="px-6">
          <div className="space-y-4">
            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Business Name"
                  error={errors.businessName?.message}
                />
              )}
            />

            <Controller
              name="yearsInBusiness"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label="Years in Business"
                  options={yearsInBusinessOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.yearsInBusiness?.message}
                />
              )}
            />

            <Controller
              name="companyRegistrationNumber"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Company Registration Number"
                  error={errors.companyRegistrationNumber?.message}
                />
              )}
            />

            <Controller
              name="businessRegistrationType"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label="Business Registration Type"
                  options={businessRegistrationTypeOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.businessRegistrationType?.message}
                />
              )}
            />

            <Controller
              name="businessDescription"
              control={control}
              render={({ field }) => (
                <FloatingLabelTextarea
                  {...field}
                  label="Business Description"
                  error={errors.businessDescription?.message}
                  showCharCount
                  maxLength={500}
                  rows={4}
                />
              )}
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="bg-primary/5 px-4 py-4">
            <h3 className="">Contact Information</h3>
          </div>

          <div className="px-6 space-y-4">
            <Controller
              name="primaryContactName"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Primary Contact Name"
                  error={errors.primaryContactName?.message}
                />
              )}
            />

            <Controller
              name="emailAddress"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  type="email"
                  label="Email Address"
                  error={errors.emailAddress?.message}
                />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  type="tel"
                  label="Phone Number"
                  placeholder=" "
                  error={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              name="meansOfIdentification"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Means of Identification"
                  error={errors.meansOfIdentification?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="houseNumber"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="House Number"
                    error={errors.houseNumber?.message}
                  />
                )}
              />

              <Controller
                name="buildingNumber"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Building No."
                    error={errors.buildingNumber?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Street"
                  error={errors.streetAddress?.message}
                />
              )}
            />

            <Controller
              name="zipCode"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  {...field}
                  label="Zip Code"
                  error={errors.zipCode?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Service Area Section */}
        <div className="space-y-4">
          <div className="bg-primary/5 px-4 py-4">
            <h3 className="">Service Area</h3>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Service Locations */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Where do you provide services?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                  placeholder="Enter location (e.g., London, UK)"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <Button
                  type="button"
                  onClick={handleAddLocation}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Add
                </Button>
              </div>
              {serviceLocations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {serviceLocations.map((location) => (
                    <div
                      key={location}
                      className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1 text-sm"
                    >
                      <span>{location}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(location)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.serviceLocations && (
                <p className="text-xs text-destructive">
                  {errors.serviceLocations.message}
                </p>
              )}
            </div>

            <Controller
              name="maximumTravelDistance"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label="Maximum Travel Distance"
                  options={maximumTravelDistanceOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.maximumTravelDistance?.message}
                />
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
