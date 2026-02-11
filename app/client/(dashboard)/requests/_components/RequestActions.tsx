import { useTransition, useState } from "react";
import {
  MoreHorizontal,
  Trash,
  Pencil,
  Share,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  deleteCustomerRequest,
  cancelCustomerRequest,
  submitDraft,
} from "@/lib/actions/custom-request";

interface RequestActionsProps {
  requestId: string;
  status: string;
}

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteCustomerRequest(requestId);
        if (result.success) {
          toast.success("Request deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["customer-requests"] });
        } else {
          toast.error(result.error || "Failed to delete request");
        }
      } catch (error) {
        toast.error("An error occurred while deleting");
      } finally {
        setShowDeleteDialog(false);
      }
    });
  };

  const handleSubmitDraft = () => {
    startTransition(async () => {
      try {
        const result = await submitDraft(requestId);
        if (result.success) {
          toast.success("Draft submitted successfully!");
          queryClient.invalidateQueries({ queryKey: ["customer-requests"] });
        } else {
          toast.error(result.error || "Failed to submit draft");
        }
      } catch (error) {
        toast.error("An error occurred while submitting");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const result = await cancelCustomerRequest(requestId);
        if (result.success) {
          toast.success("Request cancelled successfully");
          queryClient.invalidateQueries({ queryKey: ["customer-requests"] });
        } else {
          toast.error(result.error || "Failed to cancel request");
        }
      } catch (error) {
        toast.error("An error occurred while cancelling");
      }
    });
  };

  const isDraft = status === "draft";
  const canCancel = status === "pending_approval" || status === "active";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isDraft && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/client/custom-request/edit/${requestId}`)
              }
              disabled={isPending}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Draft
            </DropdownMenuItem>
          )}
          {isDraft && (
            <DropdownMenuItem onClick={handleSubmitDraft} disabled={isPending}>
              <Send className="mr-2 h-4 w-4" />
              Submit Draft
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem onClick={handleCancel} disabled={isPending}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Request
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              custom request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
