"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { BusinessSetupForm } from "../_components/BusinessSetupForm";
import { useVendorOnboardingRedirect } from "../_hooks/useVendorOnboardingRedirect";

export default function BusinessSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  // Check onboarding stage and redirect if necessary
  // Stage 0 = Step 1 (Business Setup)
  useVendorOnboardingRedirect(0);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  return <BusinessSetupForm />;
}
