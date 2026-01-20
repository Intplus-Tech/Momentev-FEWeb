"use client";

import { useBusinessSetup } from "../_context/BusinessSetupContext";

export function ProgressBar() {
  const { completedSections } = useBusinessSetup();
  const total = 2;
  const percentage = (completedSections.size / total) * 100;

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
        {completedSections.size} of {total} completed
      </span>
    </div>
  );
}
