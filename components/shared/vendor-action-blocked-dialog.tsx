"use client";

import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  VENDOR_SUSPENDED_DESCRIPTION,
  VENDOR_SUSPENDED_HELP_TEXT,
  VENDOR_SUSPENDED_TITLE,
  VENDOR_SUPPORT_HREF,
  type VendorActionRestriction,
} from "@/lib/vendor-access";

interface VendorActionBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restriction?: VendorActionRestriction | null;
}

export function VendorActionBlockedDialog({
  open,
  onOpenChange,
  restriction = null,
}: VendorActionBlockedDialogProps) {
  const title = restriction?.title || VENDOR_SUSPENDED_TITLE;
  const description = restriction?.description || VENDOR_SUSPENDED_DESCRIPTION;
  const helpText = restriction?.helpText || VENDOR_SUSPENDED_HELP_TEXT;
  const supportHref = restriction?.supportHref || VENDOR_SUPPORT_HREF;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{helpText}</p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              window.location.href = supportHref;
            }}
          >
            Contact support
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}