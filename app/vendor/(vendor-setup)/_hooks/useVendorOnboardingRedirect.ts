"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user";
import { toast } from "sonner";

type StepConfig = {
  stage: number;
  path: string;
  label: string;
};

const STEP_CONFIG: StepConfig[] = [
  { stage: 0, path: "/vendor/business-setup", label: "Business Setup" },
  { stage: 1, path: "/vendor/service-setup", label: "Service Setup" },
  { stage: 2, path: "/vendor/payment-setup", label: "Payment Setup" },
  { stage: 3, path: "/vendor/dashboard", label: "Dashboard" },
];

/**
 * Hook to handle vendor onboarding redirects based on onboardingStage
 * If user tries to access a step they haven't reached yet, they're redirected to their current stage
 * If user's stage is complete, they're redirected to dashboard
 */
export function useVendorOnboardingRedirect(requiredStage: number) {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const profileResult = await getUserProfile();

        if (!profileResult.success || !profileResult.data?.vendor) {
          toast.error("Unable to verify your onboarding stage");
          return;
        }

        const currentStage = profileResult.data.vendor.onBoardingStage ?? 0;

        // If user's stage is higher than required stage, they've already completed this
        // Don't allow going back - redirect to their current stage
        if (currentStage > requiredStage) {
          const currentStepConfig = STEP_CONFIG.find(
            (s) => s.stage === currentStage,
          );

          if (currentStepConfig) {
            router.replace(currentStepConfig.path);
            toast("You've already completed this step. Moving to your current step...");
          }
        }
        // If user's stage is lower than required stage, they haven't reached this yet
        // Redirect to their current stage
        else if (currentStage < requiredStage) {
          const currentStepConfig = STEP_CONFIG.find(
            (s) => s.stage === currentStage,
          );

          if (currentStepConfig) {
            router.replace(currentStepConfig.path);
            toast(`Please complete ${currentStepConfig.label} first`);
          }
        }
        // If currentStage === requiredStage, user is on the correct step - do nothing
      } catch (error) {
        console.error("❌ Error checking onboarding stage:", error);
        toast.error("Error verifying your progress");
      }
    };

    checkAndRedirect();
  }, [requiredStage, router]);
}
