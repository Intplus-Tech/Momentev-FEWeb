"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ClientHeader } from "./_components/ClientHeader";
import { useClientActionGuard } from "@/hooks/use-client-action-guard";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_BAN_TITLE, CLIENT_BAN_DESCRIPTION } from "@/lib/client-access";
import { ClientSidebar } from "./_components/ClientSidebar";
import { useUserProfile } from "@/hooks/api/use-user-profile";


function ClientBanner() {
  const { data: user, isBanned } = useClientActionGuard();

  if (!isBanned) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-50 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-3 w-full">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-semibold">{CLIENT_BAN_TITLE}</p>
            <p className="text-xs sm:text-sm text-foreground/80 max-w-4xl">{CLIENT_BAN_DESCRIPTION}</p>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 border-amber-500/30 bg-background/70 text-foreground hover:bg-background"
          >
            <a href="mailto:support@momentev.com">Contact support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: user } = useUserProfile();
  // console.log("Logged in user:", user?.id);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40 text-foreground">
        <ClientSidebar />
        <SidebarInset className="flex flex-1 flex-col bg-background">
          <ClientHeader />
          {/* Inline banner under header (mobile-friendly) */}
          <ClientBanner />
          <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
