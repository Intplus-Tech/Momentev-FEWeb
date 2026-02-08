"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "./_components/ProgressBar";
import { useCustomRequestStore } from "./_store/customRequestStore";
import { useEffect, useRef, useState } from "react";
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
  const hydrated = useRef(false);
  const commitRef = useRef<(() => void) | null>(null);

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

  const eventBasic = useCustomRequestStore((state) => state.eventBasic);
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const budgetPlanning = useCustomRequestStore((state) => state.budgetPlanning);
  const additionalDetails = useCustomRequestStore(
    (state) => state.additionalDetails,
  );

  // Actions
  const setCurrentStep = useCustomRequestStore((state) => state.setCurrentStep);
  const setIsSubmitting = useCustomRequestStore(
    (state) => state.setIsSubmitting,
  );
  const reset = useCustomRequestStore((state) => state.reset);

  // Hydrate step from URL or localStorage
  useEffect(() => {
    if (hydrated.current) return;
    const params = new URLSearchParams(window.location.search);
    const urlStep = Number(params.get("step"));
    const storedStep = Number(localStorage.getItem("customRequestStep"));

    const validStep = (step: number) => step >= 1 && step <= 5;
    const nextStep = validStep(urlStep)
      ? urlStep
      : validStep(storedStep)
        ? storedStep
        : 1;

    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }

    hydrated.current = true;
    setMounted(true);
  }, [currentStep, setCurrentStep]);

  // Keep URL + localStorage in sync with current step
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("customRequestStep", String(currentStep));

    const params = new URLSearchParams(window.location.search);
    if (params.get("step") !== String(currentStep)) {
      params.set("step", String(currentStep));
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentStep, mounted, router]);

  // Warn before leaving the page (refresh/close/back)
  useEffect(() => {
    if (!mounted) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mounted]);

  // Intercept in-app link navigation to prompt draft saving (placeholder)
  useEffect(() => {
    if (!mounted) return;
    const onLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript"))
        return;
      if (href === window.location.pathname + window.location.search) return;
      const confirmed = window.confirm(
        "You have unsaved changes. Save as draft before leaving?",
      );
      if (!confirmed) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        toast.message("Draft saving coming soon");
      }
    };
    document.addEventListener("click", onLinkClick, true);
    return () => document.removeEventListener("click", onLinkClick, true);
  }, [mounted]);

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

    commitRef.current?.();

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

  const handleSubmit = async (
    status: "draft" | "pending_approval" = "pending_approval",
  ) => {
    commitRef.current?.();
    setIsSubmitting(true);

    if (
      status !== "draft" &&
      (!eventBasic || !vendorNeeds || !budgetPlanning)
    ) {
      toast.error("Missing required event information");
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct payload
      const payload: any = {
        // Type assertion to bypass strict frontend checks if types aren't perfectly aligned yet
        serviceCategoryId: vendorNeeds?.selectedCategory?._id || "",
        customerId: "", // Injected on server
        eventDetails: {
          title: eventBasic?.eventName || "Draft Event",
          description: eventBasic?.eventDescription || "",
          startDate: eventBasic?.eventDate || new Date().toISOString(),
          startTime: eventBasic?.eventStartTime || "",
          endTime: eventBasic?.eventEndTime || "",
          guestCount: eventBasic?.guestCount || 0,
          location: eventBasic?.location || "",
          eventType:
            eventBasic?.eventType === "Other"
              ? eventBasic?.otherEventType || "Other"
              : eventBasic?.eventType || "",
        },
        budgetAllocations:
          vendorNeeds?.selectedSpecialties?.map((specialty) => ({
            serviceSpecialtyId: specialty._id,
            budgetedAmount:
              budgetPlanning?.budgetPerSpecialty?.[specialty._id] || 0,
          })) || [],
        attachments:
          additionalDetails?.uploadedFiles.map((file) => file._id) || [],
        inspirationLinks: additionalDetails?.inspirationLinks || [],
        status,
      };

      const result = await import("@/lib/actions/custom-request").then((mod) =>
        mod.createCustomRequest(payload),
      );

      if (result.success) {
        if (status === "draft") {
          toast.success("Draft saved successfully!");
        } else {
          toast.success("Event posted successfully!");
        }
        // Reset form and redirect
        setTimeout(() => {
          reset();
          router.push("/client/dashboard");
        }, 1000);
      } else {
        toast.error(
          result.error ||
            `Failed to ${status === "draft" ? "save draft" : "post event"}`,
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventBasicStep registerCommit={(fn) => (commitRef.current = fn)} />
        );
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
            onClick={() => handleSubmit("draft")}
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
            <Button
              onClick={() => handleSubmit("pending_approval")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Event →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
