import { ReactNode } from "react";

import VendorSetupLayoutShell from "../_components/VendorSetupLayoutShell";

export default function PaymentSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VendorSetupLayoutShell>{children}</VendorSetupLayoutShell>;
}
