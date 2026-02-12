"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "./_components/ProgressBar";
import { useCustomRequestStore } from "./_store/customRequestStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveAsDraft, submitCustomRequest } from "@/lib/actions/custom-request";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EventBasicStep,
  VendorNeedsStep,
  BudgetPlanningStep,
  AdditionalDetailsStep,
  ReviewStep,
} from "./_components/steps";
import type { CustomRequestPayload } from "@/types/custom-request";

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

/** Build payload from current store state (reads via getState, no subscription needed) */
function buildPayload(): CustomRequestPayload {
  const { eventBasic, vendorNeeds, budgetPlanning, additionalDetails } =
    useCustomRequestStore.getState();

  return {
    serviceCategoryId: vendorNeeds?.selectedCategory?._id || undefined,
    eventDetails: {
      title: eventBasic?.eventName || "Draft Event",
      description: eventBasic?.eventDescription || "",
      startDate: eventBasic?.eventDate || new Date().toISOString(),
      endDate: eventBasic?.endDate || undefined,
      guestCount: eventBasic?.guestCount || 0,
      location: eventBasic?.location || "",
    },
    budgetAllocations:
      vendorNeeds?.selectedSpecialties?.map((specialty) => ({
        serviceSpecialtyId: specialty._id,
        budgetedAmount:
          budgetPlanning?.budgetPerSpecialty?.[specialty._id] || 0,
      })) || [],
    attachments: (additionalDetails?.uploadedFiles || [])
      .filter((file) => file != null && typeof file._id === "string")
      .map((file) => file._id),
  } as CustomRequestPayload;
}

export default function CustomRequestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hydrated = useRef(false);
  const commitRef = useRef<(() => void) | null>(null);
  const isRedirecting = useRef(false);

  // Leave-page dialog state
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Store state (only subscribe to what drives rendering)
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
    if (!mounted || isRedirecting.current) return;

    localStorage.setItem("customRequestStep", String(currentStep));

    const params = new URLSearchParams(window.location.search);
    if (params.get("step") !== String(currentStep)) {
      params.set("step", String(currentStep));
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentStep, mounted, router]);

  // Warn before leaving the page (browser close/refresh only)
  useEffect(() => {
    if (!mounted) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (isRedirecting.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mounted]);

  // Intercept in-app link navigation — show AlertDialog instead of native confirm
  useEffect(() => {
    if (!mounted) return;
    const onLinkClick = (e: MouseEvent) => {
      if (isRedirecting.current) return;
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript"))
        return;
      if (href === window.location.pathname + window.location.search) return;

      // Prevent navigation and show dialog
      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(href);
      setShowLeaveDialog(true);
    };
    document.addEventListener("click", onLinkClick, true);
    return () => document.removeEventListener("click", onLinkClick, true);
  }, [mounted]);

  /** Navigate away — shared by dialog actions and post-submit redirect */
  const navigateAway = useCallback(
    (url: string) => {
      isRedirecting.current = true;
      localStorage.removeItem("customRequestStep");
      reset();
      router.push(url);
    },
    [reset, router],
  );

  /** Save current form as draft, then navigate to a URL */
  const saveAndLeave = useCallback(
    async (url: string) => {
      setIsSavingDraft(true);
      commitRef.current?.();

      // Validate that at least a category is selected for draft
      const { vendorNeeds } = useCustomRequestStore.getState();
      if (!vendorNeeds?.selectedCategory?._id) {
        toast.error("Please select a service category before saving as draft");
        setIsSavingDraft(false);
        // Don't close dialog so user can cancel and go select category
        return;
      }

      try {
        const payload = buildPayload();
        const result = await saveAsDraft(payload);

        if (result.success) {
          toast.success("Draft saved successfully!");
          navigateAway(url);
        } else {
          toast.error(result.error || "Failed to save draft");
        }
      } catch (error) {
        toast.error("An unexpected error occurred while saving");
        console.error(error);
      } finally {
        setIsSavingDraft(false);
        setShowLeaveDialog(false);
        setPendingNavUrl(null);
      }
    },
    [navigateAway],
  );

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

    // Read latest state at submit time (no subscription needed)
    const { eventBasic, vendorNeeds, budgetPlanning } =
      useCustomRequestStore.getState();

    if (status === "draft") {
      if (!vendorNeeds?.selectedCategory?._id) {
        toast.error("Please select a service category before saving as draft");
        setIsSubmitting(false);
        return;
      }
    } else {
      // Pending Approval validation
      if (!eventBasic || !vendorNeeds || !budgetPlanning) {
        toast.error("Missing required event information");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = buildPayload();
      const result =
        status === "draft"
          ? await saveAsDraft(payload)
          : await submitCustomRequest(payload);

      if (result.success) {
        toast.success(
          status === "draft"
            ? "Draft saved successfully!"
            : "Event posted successfully!",
        );
        navigateAway("/client/requests");
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
            variant="secondary"
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

      {/* Leave Page AlertDialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save your progress as
              a draft before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSavingDraft}
              onClick={() => {
                setShowLeaveDialog(false);
                setPendingNavUrl(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              disabled={isSavingDraft}
              onClick={() => {
                if (pendingNavUrl) {
                  navigateAway(pendingNavUrl);
                }
                setShowLeaveDialog(false);
                setPendingNavUrl(null);
              }}
            >
              Leave Without Saving
            </AlertDialogAction>
            <AlertDialogAction
              disabled={isSavingDraft}
              onClick={() => {
                if (pendingNavUrl) {
                  saveAndLeave(pendingNavUrl);
                }
              }}
            >
              {isSavingDraft ? "Saving..." : "Save & Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
