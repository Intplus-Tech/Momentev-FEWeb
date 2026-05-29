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
  CLIENT_BAN_DESCRIPTION,
  CLIENT_BAN_HELP_TEXT,
  CLIENT_BAN_TITLE,
  CLIENT_SUPPORT_HREF,
  type ClientActionRestriction,
} from "@/lib/client-access";

interface ClientActionBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restriction?: ClientActionRestriction | null;
}

export function ClientActionBlockedDialog({
  open,
  onOpenChange,
  restriction = null,
}: ClientActionBlockedDialogProps) {
  const title = restriction?.title || CLIENT_BAN_TITLE;
  const description = restriction?.description || CLIENT_BAN_DESCRIPTION;
  const helpText = restriction?.helpText || CLIENT_BAN_HELP_TEXT;
  const supportHref = restriction?.supportHref || CLIENT_SUPPORT_HREF;
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