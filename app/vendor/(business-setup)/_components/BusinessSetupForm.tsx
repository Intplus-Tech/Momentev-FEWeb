"use client";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { BusinessInformationForm } from "./BusinessInformationForm";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { ArrowLeft } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";

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
  } = useBusinessSetup();

  const canProceed = () => {
    // Both sections must be valid to proceed
    return isBusinessInfoValid && isDocumentsValid;
  };

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
          <div className="space-y-4 border-2 rounded-lg">
            <StepSection
              number={2}
              title="Document Upload"
              isCompleted={completedSections.has(2)}
              isExpanded={expandedSection === 2}
              onToggle={() => toggleSection(2)}
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
            {isSubmitting ? "Submitting..." : "Submit Business Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
