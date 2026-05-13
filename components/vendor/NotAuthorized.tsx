import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PermissionModule } from "@/types/permissions";

interface NotAuthorizedProps {
  module: PermissionModule | string;
}

const MODULE_LABELS: Record<string, string> = {
  chat: "Messages",
  manage_services: "Services",
  view_orders: "Orders & Bookings",
  manage_staff: "Staff Management",
  view_reports: "Reports",
  finance: "Payment & Finance",
  business_profile: "Business Profile & Settings",
};

/**
 * Rendered by Server Component pages when checkPageAccess() returns
 * allowed: false for a vendorstaff user.
 */
export function NotAuthorized({ module }: NotAuthorizedProps) {
  const label = MODULE_LABELS[module] ?? module;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Access Restricted</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account doesn&apos;t have access to{" "}
          <span className="font-medium text-foreground">{label}</span>. Please
          contact your vendor admin to request access.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/vendor/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
