import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { VendorHeader } from "./_components/VendorHeader";
import { VendorSidebar } from "./_components/VendorSidebar";
import { VendorOnboardingGuard } from "./_components/VendorOnboardingGuard";

export default function VendorDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <VendorOnboardingGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted text-foreground">
          <VendorSidebar />
          <SidebarInset className="flex flex-1 flex-col bg-background">
            <VendorHeader />
            <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-10">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </VendorOnboardingGuard>
  );
}
