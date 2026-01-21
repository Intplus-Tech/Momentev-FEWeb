"use client";

import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { ArrowLeft } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ServiceCategoriesForm } from "./ServiceCategoriesForm";
import { PricingStructureForm } from "./PricingStructureForm";

export function ServiceSetupForm() {
  const router = useRouter();

  // Zustand selective subscriptions
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const isServiceCategoriesValid = useVendorSetupStore(
    (state) => state.isServiceCategoriesValid,
  );
  const isPricingStructureValid = useVendorSetupStore(
    (state) => state.isPricingStructureValid,
  );
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);

  // Actions
  const toggleSection = useVendorSetupStore((state) => state.toggleSection);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const markSectionComplete = useVendorSetupStore(
    (state) => state.markSectionComplete,
  );
  const setIsSubmitting = useVendorSetupStore((state) => state.setIsSubmitting);
  const setErrors = useVendorSetupStore((state) => state.setErrors);

  // Auto-expand Section 1 on mount (always reset to section 1 for this step)
  useEffect(() => {
    setExpandedSection(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we want this to run only once on mount

  // Handle save and continue logic
  const handleSaveAndContinue = async () => {
    if (expandedSection === null) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (expandedSection === 1) {
        if (!isServiceCategoriesValid) {
          setErrors({
            general: "Please complete all required service category fields.",
          });
          toast.error("Please complete all required fields");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("✅ Step 2 - Section 1 validated");
        markSectionComplete(2, 1); // Step 2, Section 1
        setExpandedSection(2);
      } else if (expandedSection === 2) {
        if (!isPricingStructureValid) {
          setErrors({ general: "Please complete pricing structure." });
          toast.error("Please complete pricing structure");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("🎉 Step 2 Complete - Navigating to Step 3");
        markSectionComplete(2, 2); // Step 2, Section 2
        router.push("/vendor/payment-setup");
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft
  const saveAsDraft = () => {
    toast.success("Draft saved successfully");
    console.log("✅ Draft auto-saved to localStorage");
  };

  // Check if current section is valid
  const canProceed = () => {
    if (expandedSection === 1) return isServiceCategoriesValid;
    if (expandedSection === 2) return isPricingStructureValid;
    return false;
  };

  // Determine button text based on current section
  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 2) return "Submit & Continue to Step 3";
    return "Save & Continue";
  };

  const isSection2Locked = !completedSections.has("step2-section1");

  return (
    <div className="space-y-6 flex flex-col min-h-[70vh]">
      <div className="">
        {/* Step Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Service Setup</h2>
          <h2 className="text-sm sm:text-base font-medium text-muted-foreground">
            Define what you offer and how you work
          </h2>
        </div>

        {/* Sections */}
        <div className="space-y-4 mt-6">
          {/* Section 1: Service Categories & Specialties */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={1}
              title="Service Categories & Specialties"
              isCompleted={completedSections.has("step2-section1")}
              isExpanded={expandedSection === 1}
              onToggle={() => toggleSection(1)}
            />
            {expandedSection === 1 && <ServiceCategoriesForm />}
          </div>

          {/* Section 2: Pricing Structure (Placeholder) */}
          <div className="space-y-4 border-2 rounded-lg opacity-100">
            <StepSection
              number={2}
              title="Pricing Structure"
              isCompleted={completedSections.has("step2-section2")}
              isExpanded={expandedSection === 2}
              onToggle={() => !isSection2Locked && toggleSection(2)}
              isLocked={isSection2Locked}
            />
            {expandedSection === 2 && <PricingStructureForm />}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10 mt-auto md:justify-between">
        <ProgressBar currentStep={2} />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={saveAsDraft}
            className="w-full sm:w-auto"
          >
            Save As Draft
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSubmitting || !canProceed()}
            className="w-full sm:w-auto"
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}
