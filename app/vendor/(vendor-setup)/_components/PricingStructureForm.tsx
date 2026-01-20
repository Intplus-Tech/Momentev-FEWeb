"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pricingStructureSchema,
  type PricingStructureFormData,
} from "../_schemas/pricingStructureSchema";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";

const PRICING_TYPES = [
  { value: "hourly", label: "Hourly Rate" },
  { value: "package", label: "Package Pricing" },
  { value: "custom", label: "Custom Quotes Only" },
];

const TRAVEL_FEES = [
  { value: "50-flat", label: "£50 flat fee" },
  { value: "1-mile", label: "£1/mile" },
  { value: "custom", label: "Custom Amount" },
];

const LEAD_TIME_OPTIONS = [
  { value: "flexible", label: "Flexible" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-week", label: "1 Week" },
  { value: "4-weeks", label: "4 Weeks" },
];

const EVENT_SIZE_OPTIONS = [
  { value: "unlimited", label: "Unlimited" },
  { value: "50-guests", label: "50 guests" },
  { value: "100-guests", label: "100 guests" },
  { value: "200-guests", label: "200 guests" },
];

export function PricingStructureForm() {
  const { pricingStructure, updatePricingStructure, setPricingStructureValid } =
    useBusinessSetup();

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
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<PricingStructureFormData>({
    resolver: zodResolver(pricingStructureSchema),
    mode: "onChange",
    defaultValues: {
      pricingType: undefined,
      hourlyRate: "",
      minimumHours: "",
      packages: [],
      travelFee: "",
      leadTimeRequired: "",
      maximumEventSize: "",
      equipmentFees: [],
    },
  });

  const pricingType = watch("pricingType");

  // Field arrays for dynamic lists
  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: "packages",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control,
    name: "equipmentFees",
  });

  // Load from context on mount
  useEffect(() => {
    if (pricingStructure && !hasLoadedInitialData.current) {
      isUpdatingFromContext.current = true;
      console.log("Loading pricing structure from context:", pricingStructure);
      reset(pricingStructure as PricingStructureFormData, {
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
  }, [pricingStructure, reset]);

  // Watch all fields and update context
  useEffect(() => {
    if (isUpdatingFromContext.current) return;

    const subscription = watch((formData) => {
      console.log("📝 Updating pricing structure in context:", formData);
      updatePricingStructure(formData as Partial<PricingStructureFormData>);
    });

    return () => subscription.unsubscribe();
  }, [watch, updatePricingStructure]);

  // Update validation status
  useEffect(() => {
    setPricingStructureValid(isValid);
  }, [isValid, setPricingStructureValid]);

  const handleAddPackage = () => {
    appendPackage({
      name: "",
      price: "",
      features: [{ name: "" }],
    });
  };

  const handleAddEquipment = () => {
    appendEquipment({
      name: "",
      price: "",
    });
  };

  return (
    <div key={formKey} className="space-y-6 px-6">
      {/* Pricing Configuration Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Pricing Configuration</h3>
        </div>

        <div className="space-y-4">
          <Controller
            name="pricingType"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="How do you charge?*"
                options={PRICING_TYPES}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.pricingType?.message}
              />
            )}
          />

          {/* Hourly Rate Fields */}
          {pricingType === "hourly" && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <Controller
                name="hourlyRate"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Base Hourly Rate*"
                    type="number"
                    error={errors.hourlyRate?.message}
                  />
                )}
              />
              <Controller
                name="minimumHours"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Minimum Hours*"
                    type="number"
                    error={errors.minimumHours?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Package Pricing */}
          {pricingType === "package" && (
            <div className="space-y-4">
              {packageFields.map((packageField, packageIndex) => (
                <div
                  key={packageField.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox checked className="mt-3" />
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name={`packages.${packageIndex}.name`}
                          control={control}
                          render={({ field }) => (
                            <FloatingLabelInput
                              {...field}
                              label="Package Name*"
                              error={
                                errors.packages?.[packageIndex]?.name?.message
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`packages.${packageIndex}.price`}
                          control={control}
                          render={({ field }) => (
                            <FloatingLabelInput
                              {...field}
                              label="Price*"
                              type="number"
                              error={
                                errors.packages?.[packageIndex]?.price?.message
                              }
                            />
                          )}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Features of this package
                        </p>
                        <Controller
                          name={`packages.${packageIndex}.features`}
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              {(field.value || []).map(
                                (feature, featureIndex) => (
                                  <div
                                    key={featureIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      value={feature.name}
                                      onChange={(e) => {
                                        const newFeatures = [
                                          ...(field.value || []),
                                        ];
                                        newFeatures[featureIndex] = {
                                          name: e.target.value,
                                        };
                                        field.onChange(newFeatures);
                                      }}
                                      placeholder="Feature name"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newFeatures = field.value?.filter(
                                          (_, i) => i !== featureIndex,
                                        );
                                        field.onChange(newFeatures);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ),
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  field.onChange([
                                    ...(field.value || []),
                                    { name: "" },
                                  ]);
                                }}
                                className="text-xs"
                              >
                                + Add Feature
                              </Button>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePackage(packageIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                onClick={handleAddPackage}
                className="text-primary"
              >
                + Add Package
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Fees Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Additional Fees</h3>
        </div>

        <div className="space-y-4">
          <Controller
            name="travelFee"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Travel Fees (Outside service area)"
                options={TRAVEL_FEES}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.travelFee?.message}
              />
            )}
          />

          <Controller
            name="leadTimeRequired"
            control={control}
            render={({ field }) => (
              <FloatingLabelSelect
                label="Lead Time Required"
                options={LEAD_TIME_OPTIONS}
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
                options={EVENT_SIZE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.maximumEventSize?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Equipment Fees Section */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Equipment Fees*</h3>
        </div>

        <div className="space-y-3">
          {equipmentFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Controller
                name={`equipmentFees.${index}.name`}
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Equipment Name"
                    className="flex-1"
                  />
                )}
              />
              <Controller
                name={`equipmentFees.${index}.price`}
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Price (optional)"
                    type="number"
                    className="w-32"
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEquipment(index)}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="link"
            onClick={handleAddEquipment}
            className="text-primary"
          >
            + Add Custom Fee
          </Button>
        </div>
      </div>
    </div>
  );
}
