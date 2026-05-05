"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { ServiceSetupForm } from "../_components/ServiceSetupForm";
import { useVendorOnboardingRedirect } from "../_hooks/useVendorOnboardingRedirect";

export default function ServiceSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  // Check onboarding stage and redirect if necessary
  // Stage 1 = Step 2 (Service Setup)
  useVendorOnboardingRedirect(1);

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  return <ServiceSetupForm />;
}
