"use client";

import { useVendorSetupStore } from "../_store/vendorSetupStore";

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const total = 2; // Each step has 2 sections

  // Count only sections completed for the current step
  const completedForCurrentStep = Array.from(completedSections).filter(
    (sectionId) => sectionId.startsWith(`step${currentStep}-`),
  ).length;

  const percentage = (completedForCurrentStep / total) * 100;

  return (
    <div className="space-y-0 w-full pt-3 sm:pt-5">
      <div className="flex items-center justify-between"></div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {completedForCurrentStep} of {total} completed
      </span>
    </div>
  );
}
