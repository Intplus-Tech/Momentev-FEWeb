"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { ProfileCompletionForm } from "../_components/ProfileCompletionForm";

export default function ProfileSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  return <ProfileCompletionForm />;
}
