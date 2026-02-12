"use client";

import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { BusinessInformationForm } from "./BusinessInformationForm";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitBusinessInformation } from "@/lib/actions/vendor-setup";
import type { BusinessInfoFormData } from "../_schemas/businessInfoSchema";
import { SubmissionOverlay } from "./SubmissionOverlay";

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
  const activeUploads = useVendorSetupStore((state) => state.activeUploads);

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
        if (!isBusinessInfoValid) {
          setErrors({
            general:
              "Please complete all required business information fields.",
          });
          toast.error("Please complete all required fields");
          setIsSubmitting(false);
          return;
        }

        // Just mark complete and move to next section (Local Save)

        markSectionComplete(1, 1); // Step 1, Section 1
        setExpandedSection(2);
      } else if (expandedSection === 2) {
        if (!isDocumentsValid) {
          setErrors({ general: "Please upload all required documents." });
          toast.error("Please upload all required documents");
          setIsSubmitting(false);
          return;
        }

        // Final Submission: Submit Business Info + Documents
        const storeState = useVendorSetupStore.getState();
        const businessInfo = storeState.businessInfo;

        if (!businessInfo) {
          toast.error("No business information found");
          setIsSubmitting(false);
          return;
        }

        toast.loading("Submitting business information...");

        // Get document IDs from store directly
        const documents = {
          identification: storeState.documents.identification.map((d) => d.id),
          registration: storeState.documents.registration.map((d) => d.id),
          license: storeState.documents.license.map((d) => d.id),
        };

        const result = await submitBusinessInformation(
          businessInfo as BusinessInfoFormData,
          documents,
        );
        toast.dismiss();

        if (!result.success) {
          setErrors({ general: result.error || "Failed to submit" });
          toast.error(result.error || "Failed to submit business information");
          setIsSubmitting(false);
          return;
        }

        toast.success("Business setup Step 1 completed successfully!");

        markSectionComplete(1, 2); // Step 1, Section 2
        router.push("/vendor/service-setup");
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
      toast.dismiss();
    } finally {
      setIsSubmitting(false);
    }
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
    <>
      <SubmissionOverlay
        isVisible={isSubmitting}
        message="Submitting business information..."
      />
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
              onClick={handleSaveAndContinue}
              disabled={isSubmitting || !canProceed() || activeUploads > 0}
              className="w-full sm:w-auto"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
