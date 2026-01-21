"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { ServiceSetupForm } from "../_components/ServiceSetupForm";

export default function ServiceSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  return <ServiceSetupForm />;
}
