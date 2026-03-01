"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Building2, 
  CalendarClock, 
  ChevronRight, 
  Clock, 
  MapPin, 
  AlertCircle,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ClientDispute, cancelDispute } from "@/lib/actions/disputes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DisputeCardProps {
  dispute: ClientDispute;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "mediation":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "evidence":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "review":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "escalated":
      return "bg-red-100 text-red-800 border-red-200";
    case "closed":
      return "bg-green-100 text-green-800 border-green-200";
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "low":
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(amount);
};

export function DisputeCard({ dispute }: DisputeCardProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelDispute(dispute._id);
      if (result.success) {
        toast.success("Dispute cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel dispute");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancellable = !["closed", "archived"].includes(dispute.status.toLowerCase());

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center border-b pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              Case {dispute.caseId}
              <Badge variant="outline" className={`ml-2 capitalize rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPriorityColor(dispute.priority)}`}>
                {dispute.priority} Priority
              </Badge>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Filed {format(new Date(dispute.filedAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Disputed Amount:</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(dispute.amountInDisputeMinor / 100, dispute.currency)}
            </span>
          </div>
          <Badge className={`capitalize font-medium ${getStatusColor(dispute.status)}`}>
            {dispute.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Booking Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Vendor Details
          </div>
          <div className="rounded-lg bg-muted/40 p-4 space-y-3 border">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold">{dispute.vendor.nameSnapshot}</span>
            </div>
            {dispute.booking?.bookingId?.eventDetails && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>Event: {dispute.booking.bookingId.eventDetails.title}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location: {dispute.booking.locationSnapshot}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Date: {format(new Date(dispute.booking.dateSnapshot), "MMM d, yyyy h:mm a")}</span>
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Claim Information
          </div>
          <div className="rounded-lg bg-muted/40 p-4 space-y-3 border h-full">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Client Reason</span>
              <p className="text-sm mt-1 line-clamp-3 text-foreground">{dispute.reason.clientClaim}</p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t mt-3">
              <span className="text-sm font-medium text-muted-foreground">Requested Refund</span>
              <span className="text-sm font-bold text-foreground">{dispute.reason.requestedRefundPercent}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Evidence Uploaded</span>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                {dispute.reason.clientAttachments?.length || 0} file(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t mt-2">
        {isCancellable && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isCancelling}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {isCancelling && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Cancel Dispute
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently cancel the dispute and archive the case.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Dispute</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelClick} className="bg-red-600 text-white hover:bg-red-700 flex items-center">
                  {isCancelling && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Yes, Cancel Dispute
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button variant="default" size="sm" className="gap-2">
          View Resolution Thread <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
