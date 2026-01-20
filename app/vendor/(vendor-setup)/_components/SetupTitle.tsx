"use client";

import { useBusinessSetup } from "../_context/BusinessSetupContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STEP_TITLES = {
  1: "Business Basics",
  2: "Service Setup",
  3: "Payment Configuration",
  4: "Profile Completion",
} as const;

const ROUTE_TO_STEP: Record<string, number> = {
  "/vendor/business-setup": 1,
  "/vendor/service-setup": 2,
  "/vendor/payment-setup": 3,
  "/vendor/profile-setup": 4,
};

export default function SetupTitle() {
  const pathname = usePathname();
  const { currentStep, setCurrentStep } = useBusinessSetup();
  const totalSteps = 4;

  // Auto-detect step from route
  useEffect(() => {
    const detectedStep = ROUTE_TO_STEP[pathname];
    if (detectedStep && detectedStep !== currentStep) {
      setCurrentStep(detectedStep);
    }
  }, [pathname, currentStep, setCurrentStep]);

  return (
    <div className="fixed z-50 bg-background w-full px-4 py-4 border-b h-13 flex items-center justify-between">
      <h1 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground">
        {currentStep}. {STEP_TITLES[currentStep as keyof typeof STEP_TITLES]}
      </h1>
      <span className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}
