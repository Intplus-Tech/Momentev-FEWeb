"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onContinueLater?: () => void;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  title,
  onContinueLater,
}: StepIndicatorProps) {
  return (
    <div className="flex items-start justify-between border-b pb-4">
      {/* <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your business profile to start receiving bookings
        </p>
      </div> */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {onContinueLater && (
          <button
            onClick={onContinueLater}
            className="flex items-center gap-1 text-sm text-destructive hover:underline"
          >
            Continue Later
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
