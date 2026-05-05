"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user";
import { toast } from "sonner";
import {
  clearOnboardingStageOverride,
  getOnboardingStageOverride,
} from "../_utils/onboardingStageOverride";

type StepConfig = {
  stage: number;
  path: string;
  label: string;
};

const STEP_CONFIG: StepConfig[] = [
  { stage: 0, path: "/vendor/business-setup", label: "Business Setup" },
  { stage: 1, path: "/vendor/service-setup", label: "Service Setup" },
  { stage: 2, path: "/vendor/payment-setup", label: "Payment Setup" },
  { stage: 3, path: "/vendor/profile-setup", label: "Profile Setup" },
  { stage: 4, path: "/vendor/dashboard", label: "Dashboard" },
];

/**
 * Hook to handle vendor onboarding redirects based on onboardingStage
 * If user tries to access a step they haven't reached yet, they're redirected to their current stage
 * If user's stage is complete, they're redirected to dashboard
 */
export function useVendorOnboardingRedirect(requiredStage: number) {
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const checkAndRedirect = async () => {
      try {
        // Retry a few times to avoid redirecting on temporarily stale onboarding stage.
        const maxRetries = 4;
        let currentStage = 0;
        let hasValidProfile = false;
        const overrideStage = getOnboardingStageOverride();

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const profileResult = await getUserProfile();

          if (isCancelled) return;

          if (profileResult.success && profileResult.data?.vendor) {
            hasValidProfile = true;
            currentStage = profileResult.data.vendor.onBoardingStage ?? 0;

            const effectiveStage =
              overrideStage !== null ? Math.max(currentStage, overrideStage) : currentStage;

            // If backend catches up, clear temporary override.
            if (overrideStage !== null && currentStage >= overrideStage) {
              clearOnboardingStageOverride();
            }

            // If stage is behind required stage, it might be eventual consistency right after submit.
            if (effectiveStage < requiredStage && attempt < maxRetries - 1) {
              await sleep(350 * (attempt + 1));
              continue;
            }

            currentStage = effectiveStage;

            break;
          }

          if (attempt < maxRetries - 1) {
            await sleep(300);
          }
        }

        if (!hasValidProfile) {
          toast.error("Unable to verify your onboarding stage");
          return;
        }

        // If user's stage is higher than required stage, they've already completed this
        // Don't allow going back - redirect to their current stage
        if (currentStage > requiredStage) {
          const currentStepConfig = STEP_CONFIG.find(
            (s) => s.stage === currentStage,
          );

          if (currentStepConfig) {
            router.replace(currentStepConfig.path);
            toast("You've already completed this step. Moving to your current step...");
          } else if (currentStage >= 4) {
            router.replace("/vendor/dashboard");
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

    return () => {
      isCancelled = true;
    };
  }, [requiredStage, router]);
}
