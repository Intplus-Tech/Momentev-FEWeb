import { ReactNode } from "react";

import Header from "./header";
import Sidebar from "./sidebar";
import SetupTitle from "./SetupTitle";

type VendorSetupLayoutShellProps = {
  children: ReactNode;
};

export default async function VendorSetupLayoutShell({
  children,
}: VendorSetupLayoutShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 pt-16 lg:pl-64 relative">
          <SetupTitle />
          <div className="mx-auto w-full max-w-5xl px-4 py-6 mt-10 md:px-6 md:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}