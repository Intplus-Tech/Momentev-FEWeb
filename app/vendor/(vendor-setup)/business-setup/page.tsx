"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { BusinessSetupForm } from "../_components/BusinessSetupForm";

export default function BusinessSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  return <BusinessSetupForm />;
}
