"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { deleteAccount } from "@/lib/actions/user";
import { clearAuthCookies } from "@/lib/session";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteAccount();

      if (!result.success) {
        toast.error("Failed to delete account", {
          description: result.error || "An unexpected error occurred",
        });
        setIsDeleting(false);
        return;
      }

      // Successfully deleted - logout and redirect
      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });

      // Clear auth cookies and redirect to home
      await clearAuthCookies();
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete account", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
          <div>
            This action is <strong>irreversible</strong>. All your data will be
            permanently removed from our servers.
            <br />
            <br />
            <strong>What gets deleted:</strong>
            <div className="mt-2 list-inside list-disc space-y-1 text-left">
              <p>Your account and profile</p>
              <p>Associated personal information</p>
              <p>User's bookings and transactions</p>
              <p>All data related to this user</p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete My Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
