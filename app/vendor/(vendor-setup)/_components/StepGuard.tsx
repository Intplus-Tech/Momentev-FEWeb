"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { Loader2 } from "lucide-react";

interface StepGuardProps {
  requiredStep: number;
  children: React.ReactNode;
}

/**
 * Route guard component for vendor setup wizard
 * Prevents users from skipping steps by checking if previous steps are complete
 *
 * Step requirements:
 * - Step 1 (Business Setup): No requirements (entry point)
 * - Step 2 (Service Setup): Step 1 must be complete (step1-section1 and step1-section2)
 * - Step 3 (Payment Setup): Steps 1-2 must be complete
 * - Step 4 (Profile Setup): Steps 1-3 must be complete
 * - Step 5 (Review): Steps 1-4 must be complete
 */
export function StepGuard({ requiredStep, children }: StepGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );

  useEffect(() => {
    // Step 1 is always accessible (entry point)
    if (requiredStep === 1) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // Check if all previous steps are complete
    const isStepComplete = (step: number): boolean => {
      // Each step has 2 sections that must be completed
      const section1Key = `step${step}-section1`;
      const section2Key = `step${step}-section2`;
      return (
        completedSections.has(section1Key) && completedSections.has(section2Key)
      );
    };

    // Check all steps from 1 to (requiredStep - 1)
    let canAccess = true;
    let redirectToStep = 1;

    for (let step = 1; step < requiredStep; step++) {
      if (!isStepComplete(step)) {
        canAccess = false;
        redirectToStep = step;
        break;
      }
    }

    if (canAccess) {
      setIsAuthorized(true);
      setIsChecking(false);
    } else {
      // Redirect to the incomplete step
      const stepRoutes: Record<number, string> = {
        1: "/vendor/business-setup",
        2: "/vendor/service-setup",
        3: "/vendor/payment-setup",
        4: "/vendor/profile-setup",
        5: "/vendor/setup-review",
      };

      router.replace(stepRoutes[redirectToStep]);
    }
  }, [requiredStep, completedSections, router]);

  // Show loading while checking authorization
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying progress...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
