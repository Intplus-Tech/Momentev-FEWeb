import { ReactNode } from "react";

import VendorSetupLayoutShell from "../_components/VendorSetupLayoutShell";

export default function BusinessSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VendorSetupLayoutShell>{children}</VendorSetupLayoutShell>;
}
