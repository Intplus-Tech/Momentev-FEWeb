"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { PaymentConfigurationForm } from "../_components/PaymentConfigurationForm";
import { StepGuard } from "../_components/StepGuard";

export default function PaymentSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  return (
    <StepGuard requiredStep={3}>
      <PaymentConfigurationForm />
    </StepGuard>
  );
}
