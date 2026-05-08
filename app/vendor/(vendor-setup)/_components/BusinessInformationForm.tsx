"use client";

import { useEffect, useRef, useState } from "react";
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
import { CityAutocomplete } from "./CityAutocomplete";
import { getUserProfile } from "@/lib/actions/user";
import { FormFieldLabel } from "./FormFieldLabel";

interface ServiceLocation {
  city: string;
  state: string;
  country: string;
}

export function BusinessInformationForm() {
  // Zustand selective subscriptions
  const businessInfo = useVendorSetupStore((state) => state.businessInfo);
  const updateBusinessInfo = useVendorSetupStore(
    (state) => state.updateBusinessInfo,
  );
  const setBusinessInfoValid = useVendorSetupStore(
    (state) => state.setBusinessInfoValid,
  );

  // Use ServiceLocation type for state
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>(
    [],
  );
  const isUpdatingFromContext = useRef(false);
  const [formKey, setFormKey] = useState(0); // Key to force re-render

  const defaultBusinessInfo: BusinessInfoFormData = {
    businessName: "",
    yearsInBusiness: "",
    businessRegistrationType: "",
    companyRegistrationNumber: "",
    businessDescription: "",
    serviceLocations: [],
    maximumTravelDistance: "",
    workingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    mode: "onChange",
    defaultValues: defaultBusinessInfo,
  });

  const hasLoadedInitialData = useRef(false);
  const hasPrefilledBusinessName = useRef(false);
  const isMounted = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Prefill the business name from the user profile (firstName) when the field is empty.
  useEffect(() => {
    const prefillBusinessName = async () => {
      if (hasPrefilledBusinessName.current) return;
      try {
        const profileResult = await getUserProfile();
        if (!profileResult?.data) return;
        const businessName = profileResult.data.firstName.trim();
        if (!businessName) return;

        const nextBusinessInfo = {
          ...defaultBusinessInfo,
          ...(businessInfo ?? {}),
          businessName,
        };

        hasPrefilledBusinessName.current = true;
        isUpdatingFromContext.current = true;
        updateBusinessInfo(nextBusinessInfo);
        setValue("businessName", businessName, { shouldValidate: true, shouldDirty: false });

        setTimeout(() => {
          if (isMounted.current) {
            isUpdatingFromContext.current = false;
          }
        }, 100);
      } catch (e) {
        // ignore
      }
    };

    void prefillBusinessName();
  }, [businessInfo?.businessName, setValue, updateBusinessInfo]);

  // Load from context on mount or when businessInfo changes initially
  useEffect(() => {
    if (businessInfo && !hasLoadedInitialData.current) {
      isUpdatingFromContext.current = true;

      // Reset with keepDefaultValues: false to ensure all fields update
      reset(businessInfo as unknown as BusinessInfoFormData, {
        keepDefaultValues: false,
      });

      if (businessInfo.serviceLocations) {
        setServiceLocations(
          businessInfo.serviceLocations as unknown as ServiceLocation[],
        );
      }

      hasLoadedInitialData.current = true;
      // Force form re-render
      setFormKey((prev) => prev + 1);
      // Use setTimeout to ensure the flag is reset after all updates
      setTimeout(() => {
        if (isMounted.current) {
          isUpdatingFromContext.current = false;
        }
      }, 100);
    }
  }, [businessInfo, reset]);

  // Update context on form change (only when user changes, not context updates)
  useEffect(() => {
    const subscription = watch((formData) => {
      if (!isUpdatingFromContext.current) {
        updateBusinessInfo(
          formData as unknown as Partial<BusinessInfoFormData>,
        );
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
    setValue("serviceLocations", serviceLocations as any, {
      shouldValidate: true,
    });
  }, [serviceLocations, setValue]);

  const handleLocationSelect = (location: {
    city: string;
    state: string;
    country: string;
  }) => {
    // Check for duplicates based on city and state
    const isDuplicate = serviceLocations.some(
      (loc) =>
        loc.city.toLowerCase() === location.city.toLowerCase() &&
        loc.state.toLowerCase() === location.state.toLowerCase(),
    );

    if (!isDuplicate) {
      setServiceLocations([
        ...serviceLocations,
        {
          city: location.city,
          state: location.state,
          country: location.country,
        },
      ]);
    } else {
      // Optional: Toast "Location already added"
    }
  };

  const handleRemoveLocation = (indexToRemove: number) => {
    setServiceLocations(
      serviceLocations.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleFormSubmit = async (data: BusinessInfoFormData) => {
    updateBusinessInfo(data);
  };

  // Helper: Convert 24-hour "HH:MM" to 12-hour parts
  const parse24To12 = (timeStr?: string) => {
    if (!timeStr) return { hour: "12", minute: "00", ampm: "AM" };
    const [hh, mm] = timeStr.split(":");
    let h = Number(hh);
    const m = mm || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: String(h), minute: m, ampm };
  };

  // Helper: Convert 12-hour parts to 24-hour "HH:MM"
  const to24HourString = (hour12: string, minute: string, ampm: string) => {
    let h = Number(hour12);
    const m = minute.padStart(2, "0");
    if (ampm === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }
    return `${String(h).padStart(2, "0")}:${m}`;
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
                  label={<FormFieldLabel label="Business Name" isRequired />}
                  error={errors.businessName?.message}
                />
              )}
            />

            <Controller
              name="yearsInBusiness"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label={<FormFieldLabel label="Years in Business" isRequired />}
                  options={yearsInBusinessOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.yearsInBusiness?.message}
                />
              )}
            />

            <Controller
              name="businessRegistrationType"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label={<FormFieldLabel label="Business Registration Type" isRequired />}
                  options={businessRegistrationTypeOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.businessRegistrationType?.message}
                />
              )}
            />

            {watch("businessRegistrationType") === "company" && (
              <Controller
                name="companyRegistrationNumber"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label={<FormFieldLabel label="Company Registration Number" isRequired={false} />}
                    error={errors.companyRegistrationNumber?.message}
                  />
                )}
              />
            )}

            <Controller
              name="businessDescription"
              control={control}
              render={({ field }) => (
                <FloatingLabelTextarea
                  {...field}
                  label={<FormFieldLabel label="Business Description" isRequired />}
                  error={errors.businessDescription?.message}
                  showCharCount
                  maxLength={500}
                  rows={4}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Service Area Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4">
          <h3 className="">Service Area</h3>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <Controller
            name="serviceLocations"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  <FormFieldLabel label="Service Locations" isRequired />
                </label>

                <CityAutocomplete
                  onLocationSelect={(location) => {
                    const isDuplicate = serviceLocations.some(
                      (loc) =>
                        loc.city.toLowerCase() === location.city.toLowerCase() &&
                        loc.state.toLowerCase() === location.state.toLowerCase(),
                    );

                    if (!isDuplicate) {
                      const nextLocations = [
                        ...serviceLocations,
                        {
                          city: location.city,
                          state: location.state,
                          country: location.country,
                        },
                      ];

                      setServiceLocations(nextLocations);
                      field.onChange(nextLocations);
                    }
                  }}
                />

                {serviceLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {serviceLocations.map((location, index) => (
                      <div
                        key={`${location.city}-${location.state}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm"
                      >
                        <span>
                          {location.city}, {location.state}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextLocations = serviceLocations.filter(
                              (_, currentIndex) => currentIndex !== index,
                            );
                            setServiceLocations(nextLocations);
                            field.onChange(nextLocations);
                          }}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Remove ${location.city}, ${location.state}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.serviceLocations && (
                  <p className="text-xs text-destructive">
                    {errors.serviceLocations.message as string}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="maximumTravelDistance"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label={<FormFieldLabel label="Maximum Travel Distance" isRequired />}
                options={maximumTravelDistanceOptions}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.maximumTravelDistance?.message}
              />
            )}
          />
        </div>

        {/* Availability Section */}
        <div className="space-y-4">
          <div className="bg-primary/5 px-4 py-4">
            <h3 className="">Availability</h3>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Working Days */}
            <Controller
              name="workingDays"
              control={control}
              render={({ field }) => {
                const workingDays = field.value ?? defaultBusinessInfo.workingDays;

                return (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      <FormFieldLabel label="Working Days" isRequired />
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(workingDays).map(([day, checked]) => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day}
                            checked={checked}
                            onChange={(e) =>
                              field.onChange({
                                ...workingDays,
                                [day]: e.target.checked,
                              })
                            }
                            className="rounded border-input"
                          />
                          <label
                            htmlFor={day}
                            className="cursor-pointer capitalize text-sm"
                          >
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.workingDays && (
                      <p className="text-xs text-destructive">
                        {errors.workingDays.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Working Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="workingHoursStart"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      <FormFieldLabel label="Start Time" isRequired />
                    </label>
                    {/* 12-hour selector: hour, minute (15-min steps), AM/PM */}
                    <div className="flex gap-2">
                      {/** Hour */}
                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).hour}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(e.target.value, parts.minute, parts.ampm);
                          field.onChange(newVal);
                        }}
                      >
                        {[...Array(12)].map((_, i) => {
                          const val = String(i + 1);
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>

                      {/** Minute */}
                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).minute}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(parts.hour, e.target.value, parts.ampm);
                          field.onChange(newVal);
                        }}
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      {/** AM/PM */}
                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).ampm}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(parts.hour, parts.minute, e.target.value);
                          field.onChange(newVal);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.workingHoursStart && (
                      <p className="text-xs text-destructive">
                        {errors.workingHoursStart.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="workingHoursEnd"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      <FormFieldLabel label="End Time" isRequired />
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).hour}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(e.target.value, parts.minute, parts.ampm);
                          field.onChange(newVal);
                        }}
                      >
                        {[...Array(12)].map((_, i) => {
                          const val = String(i + 1);
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).minute}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(parts.hour, e.target.value, parts.ampm);
                          field.onChange(newVal);
                        }}
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      <select
                        className="rounded-md border px-2 py-2 text-sm"
                        value={parse24To12(field.value).ampm}
                        onChange={(e) => {
                          const parts = parse24To12(field.value);
                          const newVal = to24HourString(parts.hour, parts.minute, e.target.value);
                          field.onChange(newVal);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.workingHoursEnd && (
                      <p className="text-xs text-destructive">
                        {errors.workingHoursEnd.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
