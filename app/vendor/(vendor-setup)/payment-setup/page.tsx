"use client";

import { useEffect } from "react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { PaymentConfigurationForm } from "../_components/PaymentConfigurationForm";

export default function PaymentSetupPage() {
  const setCurrentStep = useVendorSetupStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  return <PaymentConfigurationForm />;
}
