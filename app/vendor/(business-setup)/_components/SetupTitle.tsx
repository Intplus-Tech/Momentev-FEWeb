"use client";

import { useBusinessSetup } from "../_context/BusinessSetupContext";

const STEP_TITLES = {
  1: "Business Basics",
  2: "Service Setup",
  3: "Payment Configuration",
  4: "Profile Completion",
} as const;

export default function SetupTitle() {
  const { currentStep } = useBusinessSetup();
  const totalSteps = 4;

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
