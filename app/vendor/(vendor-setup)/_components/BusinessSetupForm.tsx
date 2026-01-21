"use client";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { BusinessInformationForm } from "./BusinessInformationForm";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { ArrowLeft } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BusinessSetupForm() {
  const router = useRouter();

  // Zustand selective subscriptions (only re-render when these specific values change)
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const isBusinessInfoValid = useVendorSetupStore(
    (state) => state.isBusinessInfoValid,
  );
  const isDocumentsValid = useVendorSetupStore(
    (state) => state.isDocumentsValid,
  );
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);
  const currentStep = useVendorSetupStore((state) => state.currentStep);

  // Actions
  const toggleSection = useVendorSetupStore((state) => state.toggleSection);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const goToPreviousSection = useVendorSetupStore(
    (state) => state.goToPreviousSection,
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
        if (!isBusinessInfoValid) {
          setErrors({
            general:
              "Please complete all required business information fields.",
          });
          toast.error("Please complete all required fields");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("✅ Step 1 - Section 1 validated");
        markSectionComplete(1, 1); // Step 1, Section 1
        setExpandedSection(2);
      } else if (expandedSection === 2) {
        if (!isDocumentsValid) {
          setErrors({ general: "Please upload all required documents." });
          toast.error("Please upload all required documents");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("🎉 Step 1 Complete - Navigating to Step 2");
        markSectionComplete(1, 2); // Step 1, Section 2
        router.push("/vendor/service-setup");
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft - Zustand automatically persists to localStorage
  const saveAsDraft = () => {
    toast.success("Draft saved successfully");
    console.log("✅ Draft auto-saved to localStorage");
  };

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
  const isSection2Locked = !completedSections.has("step1-section1");

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
              isCompleted={completedSections.has("step1-section1")}
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
              isCompleted={completedSections.has("step1-section2")}
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
        <ProgressBar currentStep={1} />

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
