import { ReactNode } from "react";

import VendorSetupLayoutShell from "../_components/VendorSetupLayoutShell";

export default function ServiceSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VendorSetupLayoutShell>{children}</VendorSetupLayoutShell>;
}
