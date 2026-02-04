"use client";

import { useCustomRequestStore } from "../_store/customRequestStore";

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const completedSections = useCustomRequestStore(
    (state) => state.completedSections,
  );

  // Map steps to their total sections
  const stepSections: Record<number, number> = {
    1: 3, // Event Basic: Event Type, Date & Time, Event Details
    2: 2, // Vendor Needs: Categories, Requirements
    3: 1, // Budget Planning
    4: 1, // Additional Details
    5: 1, // Review & Post
  };

  const total = stepSections[currentStep] || 1;

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
