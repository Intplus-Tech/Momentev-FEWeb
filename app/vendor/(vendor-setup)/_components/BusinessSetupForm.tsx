"use client";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { BusinessInformationForm } from "./BusinessInformationForm";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { ArrowLeft } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";
import { useEffect } from "react";

export function BusinessSetupForm() {
  const {
    expandedSection,
    completedSections,
    isBusinessInfoValid,
    isDocumentsValid,
    isSubmitting,
    toggleSection,
    goToPreviousSection,
    handleSaveAndContinue,
    saveAsDraft,
    continueLater,
    currentStep,
    setExpandedSection,
  } = useBusinessSetup();

  // Auto-expand Section 1 on mount
  useEffect(() => {
    if (expandedSection === null) {
      setExpandedSection(1);
    }
  }, []);

  // Check if current section is valid
  const canProceed = () => {
    if (expandedSection === 1) return isBusinessInfoValid;
    if (expandedSection === 2) return isDocumentsValid;
    return false;
  };

  // Determine button text based on current section
  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 2) return "Submit & Continue to Step 2";
    return "Save & Continue";
  };

  // Check if Section 2 is locked
  const isSection2Locked = !completedSections.has(1);

  return (
    <div className="space-y-6 flex flex-col min-h-[70vh]">
      <div className="">
        {/* Step Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Business Setup</h2>
          <h2 className="text-sm sm:text-base font-medium text-muted-foreground">
            Complete your business profile to start receiving bookings
          </h2>
        </div>

        {/* Accordion: Both sections always visible */}
        <div className="space-y-4 mt-6">
          {/* Section 1: Business Information */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={1}
              title="Business Information"
              isCompleted={completedSections.has(1)}
              isExpanded={expandedSection === 1}
              onToggle={() => toggleSection(1)}
            />
            {expandedSection === 1 && <BusinessInformationForm />}
          </div>

          {/* Section 2: Document Upload */}
          <div className="space-y-4 border-2 rounded-lg opacity-100">
            <StepSection
              number={2}
              title="Document Upload"
              isCompleted={completedSections.has(2)}
              isExpanded={expandedSection === 2}
              onToggle={() => !isSection2Locked && toggleSection(2)}
              isLocked={isSection2Locked}
            />
            {expandedSection === 2 && <DocumentUploadSection />}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10 mt-auto md:justify-between">
        <ProgressBar />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={goToPreviousSection}
            disabled={expandedSection === null || expandedSection === 1}
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
