"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock } from "lucide-react";
import { PermissionModule } from "@/types/permissions";
import { usePermissions } from "@/contexts/permissions-context";

interface PermissionActionGateProps {
  module: PermissionModule;
  action: "read" | "write";
  children: React.ReactNode;
  /**
   * If true, the wrapped element will look slightly faded out and show a not-allowed cursor.
   * If false, it looks exactly like a normal button until clicked.
   * Default: true
   */
  visualIndication?: boolean;
  wrapperClassName?: string;
}

const getFriendlyModuleName = (moduleName: string) => {
  const map: Record<string, string> = {
    view_dashboard: "the Dashboard",
    manage_services: "Services & Specialties",
    view_orders: "Bookings & Quotes",
    manage_schedule: "the Calendar",
    chat: "Messages",
    finance: "Financials",
    manage_staff: "Team Settings",
    business_profile: "the Business Profile"
  };
  return map[moduleName] || moduleName.replace(/_/g, " ");
};

export function PermissionActionGate({
  module,
  action,
  children,
  visualIndication = true,
  wrapperClassName = "",
}: PermissionActionGateProps) {
  const hasAccess = usePermissions(module, action);
  const [showAlert, setShowAlert] = useState(false);

  // If the user has permission, render the children completely normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // If they DON'T have permission, wrap in an interceptor that blocks the click
  // and pops up the alert dialog instead.
  return (
    <>
      <div
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowAlert(true);
        }}
        className={`inline-block ${
          visualIndication ? "opacity-60 cursor-not-allowed" : ""
        } ${wrapperClassName}`}
      >
        <div className="pointer-events-none h-full w-full">{children}</div>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Action Blocked
            </AlertDialogTitle>
            <AlertDialogDescription>
              You don&apos;t have permission to {action === "write" ? "make changes to" : "view"} <strong>{getFriendlyModuleName(module)}</strong>. 
              Please contact your team administrator if you need access to this feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
