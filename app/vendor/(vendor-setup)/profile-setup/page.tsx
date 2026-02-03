"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { ProfileCompletionForm } from "../_components/ProfileCompletionForm";
import { StepGuard } from "../_components/StepGuard";

export default function ProfileSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  return (
    <StepGuard requiredStep={4}>
      <ProfileCompletionForm />
    </StepGuard>
  );
}
