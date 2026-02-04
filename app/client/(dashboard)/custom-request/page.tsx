"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "./_components/ProgressBar";
import { useCustomRequestStore } from "./_store/customRequestStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  EventBasicStep,
  VendorNeedsStep,
  BudgetPlanningStep,
  AdditionalDetailsStep,
  ReviewStep,
} from "./_components/steps";

const STEPS = [
  { id: 1, title: "Event Basic", description: "Tell us about your event" },
  { id: 2, title: "Vendor Needs", description: "Which vendors do you need?" },
  {
    id: 3,
    title: "Budget Planning",
    description: "Allocate your budget per vendor",
  },
  { id: 4, title: "Additional Details", description: "Add visual inspiration" },
  { id: 5, title: "Review & Post", description: "Confirm your event details" },
];

export default function CustomRequestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Store state
  const currentStep = useCustomRequestStore((state) => state.currentStep);
  const isSubmitting = useCustomRequestStore((state) => state.isSubmitting);
  const isEventBasicValid = useCustomRequestStore(
    (state) => state.isEventBasicValid,
  );
  const isVendorNeedsValid = useCustomRequestStore(
    (state) => state.isVendorNeedsValid,
  );
  const isBudgetPlanningValid = useCustomRequestStore(
    (state) => state.isBudgetPlanningValid,
  );

  // Actions
  const setCurrentStep = useCustomRequestStore((state) => state.setCurrentStep);
  const setIsSubmitting = useCustomRequestStore(
    (state) => state.setIsSubmitting,
  );
  const reset = useCustomRequestStore((state) => state.reset);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentStepInfo = STEPS.find((s) => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isEventBasicValid;
      case 2:
        return isVendorNeedsValid;
      case 3:
        return isBudgetPlanningValid;
      case 4:
        return true; // Additional details is optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Please complete all required fields");
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      toast.success(`Step ${currentStep} saved!`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Event posted successfully!");

      // Reset form and redirect
      setTimeout(() => {
        reset();
        router.push("/client/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Failed to post event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EventBasicStep />;
      case 2:
        return <VendorNeedsStep />;
      case 3:
        return <BudgetPlanningStep />;
      case 4:
        return <AdditionalDetailsStep />;
      case 5:
        return <ReviewStep />;
      default:
        return <EventBasicStep />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Post Event</h1>
        <p className="text-sm text-primary font-medium">
          Step {currentStep}: {currentStepInfo?.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {currentStepInfo?.description}
        </p>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-8">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button
              variant="link"
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-muted-foreground"
            >
              ← Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="link"
            className="text-muted-foreground"
            disabled={isSubmitting}
          >
            Save As Draft
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting || !canProceed()}
            >
              Next →
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Event →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
