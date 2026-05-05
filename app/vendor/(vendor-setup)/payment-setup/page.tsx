"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { PaymentConfigurationForm } from "../_components/PaymentConfigurationForm";
import { useVendorOnboardingRedirect } from "../_hooks/useVendorOnboardingRedirect";

export default function PaymentSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  // Check onboarding stage and redirect if necessary
  // Stage 2 = Step 3 (Payment Setup)
  useVendorOnboardingRedirect(2);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  return <PaymentConfigurationForm />;
}
