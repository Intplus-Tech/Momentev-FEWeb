"use client";

import { Check } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/api/use-user-profile";

import { useVendorSetupStore } from "../_store/vendorSetupStore";

const STEP_LABELS = [
  {
    step: 1,
    title: "Business Basics",
    completionKeys: ["step1-section1", "step1-section2"],
  },
  {
    step: 2,
    title: "Service Setup",
    completionKeys: ["step2-section1", "step2-section2"],
  },
  {
    step: 3,
    title: "Payment Configuration",
    completionKeys: ["step3-section1", "step3-section2", "step3-section3"],
  },
  {
    step: 4,
    title: "Profile Completion",
    completionKeys: ["step4-section1", "step4-section2"],
  },
  {
    step: 5,
    title: "Review & Submit",
    completionKeys: [],
  },
] as const;

const ROUTE_TO_STEP: Record<string, number> = {
  "/vendor/business-setup": 1,
  "/vendor/service-setup": 2,
  "/vendor/payment-setup": 3,
  "/vendor/profile-setup": 4,
  "/vendor/setup-review": 5,
};

export default function VendorSetupTimeline() {
  const pathname = usePathname();
  const { data: profile } = useUserProfile();
  const currentStep = useVendorSetupStore((state) => state.currentStep);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );

  const activeStep = ROUTE_TO_STEP[pathname] ?? currentStep;
  const backendCompletedSteps =
    profile?.vendor?.onBoarded === true
      ? STEP_LABELS.length
      : profile?.vendor?.onBoardingStage ?? 0;
  const localCompletedSteps = Array.from(completedSections).length;
  const completedSteps =
    profile?.vendor ? backendCompletedSteps : localCompletedSteps;

  return (
    <div className="space-y-12">
      {STEP_LABELS.map((item, index) => {
        const isCompleted = item.step <= completedSteps;
        const isActive = item.step === activeStep;
        const isLast = index === STEP_LABELS.length - 1;

        return (
          <div key={item.step} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-3 top-9 h-full w-px bg-border" />
            )}

            <div
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/25 bg-background text-muted-foreground",
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{item.step}</span>
              )}
            </div>

            <div className="min-w-0 pb-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.title}
              </p>
              <p
                className={cn(
                  isCompleted
                    ? "text-primary"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {isCompleted
                  ? "Completed"
                  : isActive
                    ? "In progress"
                    : "Pending"}
              </p>
            </div>
          </div>
        );
      })}

      <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {completedSteps} of {STEP_LABELS.length} steps
        completed
      </div>
    </div>
  );
}