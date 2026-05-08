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
} from "@/lib/client-access";

interface ClientActionBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientActionBlockedDialog({
  open,
  onOpenChange,
}: ClientActionBlockedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{CLIENT_BAN_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{CLIENT_BAN_DESCRIPTION}</AlertDialogDescription>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{CLIENT_BAN_HELP_TEXT}</p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              window.location.href = CLIENT_SUPPORT_HREF;
            }}
          >
            Contact support
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}