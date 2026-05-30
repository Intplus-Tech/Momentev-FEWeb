import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { VendorHeader } from "./_components/VendorHeader";
import { VendorBanner } from "./_components/VendorBanner";
import { VendorSidebar } from "./_components/VendorSidebar";
import { VendorOnboardingGuard } from "./_components/VendorOnboardingGuard";
import { PermissionsProvider } from "@/contexts/permissions-context";
import { getStaffSession } from "@/lib/actions/staff";

export default async function VendorDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getStaffSession();

  return (
    <VendorOnboardingGuard>
      <PermissionsProvider
        role={session?.role ?? null}
        permissions={session?.permissions ?? []}
        vendorId={session?.vendorId}
      >
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-muted text-foreground">
            <VendorSidebar />
            <SidebarInset className="flex flex-1 flex-col bg-background">
              <VendorHeader />
              <VendorBanner />
              <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-10">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </PermissionsProvider>
    </VendorOnboardingGuard>
  );
}

