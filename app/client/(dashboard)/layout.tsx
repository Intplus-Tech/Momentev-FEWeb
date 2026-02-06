"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ClientHeader } from "./_components/ClientHeader";
import { ClientSidebar } from "./_components/ClientSidebar";
import { useUserProfile } from "@/lib/react-query/hooks/use-user-profile";

export default function ClientDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: user } = useUserProfile();
  console.log("Logged in user:", user?.id);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40 text-foreground">
        <ClientSidebar />
        <SidebarInset className="flex flex-1 flex-col bg-background">
          <ClientHeader />
          <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
