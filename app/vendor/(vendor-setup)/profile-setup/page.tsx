"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { ProfileCompletionForm } from "../_components/ProfileCompletionForm";
import { useVendorOnboardingRedirect } from "../_hooks/useVendorOnboardingRedirect";

export default function ProfileSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  // Check onboarding stage and redirect if necessary
  // Stage 3 = Step 4 (Profile Setup)
  useVendorOnboardingRedirect(3);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  return <ProfileCompletionForm />;
}
