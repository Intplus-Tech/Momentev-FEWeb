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
import { useVendorSetupStore } from "../_store/vendorSetupStore";

const PRICING_TYPES = [
  { value: "hourly", label: "Hourly Rate" },
  { value: "custom", label: "Custom Quotes Only" },
];

const FEE_CATEGORIES = [
  { value: "equipment", label: "Equipment" },
  { value: "travel", label: "Travel" },
  { value: "personnel", label: "Personnel" },
  { value: "other", label: "Other" },
];

const TRANSPORT_FEE_OPTIONS = [
  { value: "flat_50", label: "£50 flat fee" },
  { value: "per_mile_1", label: "£1/mile" },
  { value: "custom", label: "Custom Amount" },
];

export function PricingStructureForm() {
  // Zustand selective subscriptions
  const pricingStructure = useVendorSetupStore(
    (state) => state.pricingStructure,
  );
  const updatePricingStructure = useVendorSetupStore(
    (state) => state.updatePricingStructure,
  );
  const setPricingStructureValid = useVendorSetupStore(
    (state) => state.setPricingStructureValid,
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
      transportFee: {
        type: undefined,
        amount: "",
      },
      additionalFees: [],
    },
  });

  const pricingType = watch("pricingType");

  // Field arrays for dynamic lists

  const {
    fields: additionalFeeFields,
    append: appendAdditionalFee,
    remove: removeAdditionalFee,
  } = useFieldArray({
    control,
    name: "additionalFees",
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

  const handleAddAdditionalFee = () => {
    appendAdditionalFee({
      name: "",
      category: "",
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
                    label="Hourly Rate*"
                    type="number"
                    error={errors.hourlyRate?.message}
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Transport Fee Section (Compulsory) */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Transport Fee*</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Controller
              name="transportFee.type"
              control={control}
              render={({ field }) => (
                <FloatingLabelSelect
                  label="Select Travel fees"
                  options={TRANSPORT_FEE_OPTIONS}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Clear custom amount if not custom
                    if (val !== "custom") {
                      setValue("transportFee.amount", "");
                    }
                  }}
                  error={errors.transportFee?.type?.message}
                  className="flex-1"
                />
              )}
            />

            {watch("transportFee.type") === "custom" && (
              <Controller
                name="transportFee.amount"
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Custom Amount"
                    type="number"
                    error={errors.transportFee?.amount?.message}
                    className="flex-1"
                  />
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Additional Fees Section (formerly Equipment Fees) */}
      <div className="space-y-4">
        <div className="bg-primary/5 px-4 py-4 -mx-6">
          <h3 className="">Additional Fees*</h3>
        </div>

        <div className="space-y-3">
          {additionalFeeFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Controller
                name={`additionalFees.${index}.name`}
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Fee Name"
                    className="flex-1"
                  />
                )}
              />
              <Controller
                name={`additionalFees.${index}.category`}
                control={control}
                render={({ field }) => (
                  <FloatingLabelSelect
                    label="Category"
                    options={FEE_CATEGORIES}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-40"
                  />
                )}
              />
              <Controller
                name={`additionalFees.${index}.price`}
                control={control}
                render={({ field }) => (
                  <FloatingLabelInput
                    {...field}
                    label="Price*"
                    type="number"
                    className="w-32"
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAdditionalFee(index)}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="link"
            onClick={handleAddAdditionalFee}
            className="text-primary"
          >
            + Add Custom Fee
          </Button>
        </div>
      </div>
    </div>
  );
}
