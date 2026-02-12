"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "../../_components/ProgressBar";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useCustomerRequest } from "@/hooks/api/use-custom-requests";
import {
  EventBasicStep,
  VendorNeedsStep,
  BudgetPlanningStep,
  AdditionalDetailsStep,
  ReviewStep,
} from "../../_components/steps";

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

export default function EditDraftPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const commitRef = useRef<(() => void) | null>(null);
  const isRedirecting = useRef(false);

  // Fetch the draft data
  const { data: draftData, isLoading, isError } = useCustomerRequest(draftId);

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
  const loadFromDraft = useCustomRequestStore((state) => state.loadFromDraft);

  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load draft data into store once fetched, enriching with category/specialty data
  useEffect(() => {
    if (draftData && !draftLoaded) {
      // Fetch missing data if serviceCategoryId or specialties are strings
      const enrichDraftData = async () => {
        const enrichedData = { ...draftData };

        // Fetch category if it's a string ID
        if (
          typeof draftData.serviceCategoryId === "string" &&
          draftData.serviceCategoryId
        ) {
          const categoryId = draftData.serviceCategoryId;
          try {
            const { fetchServiceCategoryById } =
              await import("@/lib/actions/service-category-by-id");
            const categoryResult = await fetchServiceCategoryById(categoryId);

            if (categoryResult.success && categoryResult.data) {
              enrichedData.serviceCategoryId = {
                _id: categoryResult.data.data._id,
                name: categoryResult.data.data.name,
              };
            }
          } catch (error) {
            console.error("[EditDraftPage] Error fetching category:", error);
          }
        }

        // Fetch specialties if they are string IDs
        if (
          draftData.budgetAllocations &&
          draftData.budgetAllocations.length > 0
        ) {
          try {
            const { fetchServiceSpecialtyById } =
              await import("@/lib/actions/service-specialties");

            const enrichedAllocations = await Promise.all(
              draftData.budgetAllocations.map(async (alloc) => {
                if (typeof alloc.serviceSpecialtyId === "string") {
                  const specialtyResult = await fetchServiceSpecialtyById(
                    alloc.serviceSpecialtyId,
                  );

                  if (specialtyResult.success && specialtyResult.data) {
                    return {
                      ...alloc,
                      serviceSpecialtyId: specialtyResult.data.data,
                    };
                  }
                }
                return alloc;
              }),
            );

            enrichedData.budgetAllocations = enrichedAllocations;
          } catch (error) {
            console.error("[EditDraftPage] Error fetching specialties:", error);
          }
        }

        loadFromDraft(enrichedData);
        setDraftLoaded(true);
      };

      enrichDraftData();
    }
  }, [draftData, draftLoaded, loadFromDraft]);

  // Keep URL in sync with current step
  useEffect(() => {
    if (!mounted || isRedirecting.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("step") !== String(currentStep)) {
      params.set("step", String(currentStep));
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentStep, mounted, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (isError || !draftData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-destructive">
            Failed to load draft
          </p>
          <p className="text-sm text-muted-foreground">
            The draft may have been deleted or you don&apos;t have access.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/client/requests")}
          >
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  if (!draftLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Preparing draft...</p>
        </div>
      </div>
    );
  }

  if (isError || !draftData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-destructive">
            Failed to load draft
          </p>
          <p className="text-sm text-muted-foreground">
            The draft may have been deleted or you don&apos;t have access.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/client/requests")}
          >
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  if (draftData.status !== "draft") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">This request is not a draft</p>
          <p className="text-sm text-muted-foreground">
            Only draft requests can be edited.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/client/requests")}
          >
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

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
        return true;
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

  const buildPayload = () => {
    // Build attachments array defensively — only valid string IDs
    const attachmentIds = (additionalDetails?.uploadedFiles || [])
      .filter((file) => file != null && typeof file._id === "string")
      .map((file) => file._id);

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
      attachments: attachmentIds,
    };
  };

  const handleSaveDraft = async () => {
    commitRef.current?.();
    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      const { updateDraft } = await import("@/lib/actions/custom-request");
      const result = await updateDraft(draftId, payload);

      if (result.success) {
        toast.success("Draft updated successfully!");
      } else {
        toast.error(result.error || "Failed to update draft");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDraft = async () => {
    commitRef.current?.();
    setIsSubmitting(true);

    if (!eventBasic || !vendorNeeds || !budgetPlanning) {
      toast.error("Missing required event information");
      setIsSubmitting(false);
      return;
    }

    try {
      // First update the draft with latest changes, then submit
      const payload = buildPayload();
      const { updateDraft, submitDraft } =
        await import("@/lib/actions/custom-request");

      const updateResult = await updateDraft(draftId, payload);
      if (!updateResult.success) {
        toast.error(
          updateResult.error || "Failed to save changes before submitting",
        );
        setIsSubmitting(false);
        return;
      }

      const result = await submitDraft(draftId);

      if (result.success) {
        toast.success("Event posted successfully!");
        isRedirecting.current = true;
        reset();
        router.push("/client/requests");
      } else {
        toast.error(result.error || "Failed to submit request");
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
        <h1 className="text-2xl font-semibold mb-1">Edit Draft</h1>
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
            onClick={handleSaveDraft}
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting || !canProceed()}
            >
              Next →
            </Button>
          ) : (
            <Button onClick={handleSubmitDraft} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Event →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
