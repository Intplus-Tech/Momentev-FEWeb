"use client";

import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { ArrowLeft } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";
import { useEffect } from "react";
import { ServiceCategoriesForm } from "./ServiceCategoriesForm";
import { PricingStructureForm } from "./PricingStructureForm";

export function ServiceSetupForm() {
  const {
    expandedSection,
    completedSections,
    isServiceCategoriesValid,
    isPricingStructureValid,
    isSubmitting,
    toggleSection,
    setExpandedSection,
    handleSaveAndContinue,
    saveAsDraft,
  } = useBusinessSetup();

  // Auto-expand Section 1 on mount
  useEffect(() => {
    if (expandedSection === null) {
      setExpandedSection(1);
    }
  }, []);

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

  const isSection2Locked = !completedSections.has(1);

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
              isCompleted={completedSections.has(1)}
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
              isCompleted={completedSections.has(2)}
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
        <ProgressBar />

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
