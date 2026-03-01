"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadCard } from "@/components/ui/file-upload-card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { createDispute } from "@/lib/actions/disputes";
import type { BookingResponse } from "@/types/booking";

interface CreateDisputeModalProps {
  booking: BookingResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDisputeModal({
  booking,
  open,
  onOpenChange,
}: CreateDisputeModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [clientClaim, setClientClaim] = useState("");
  const [requestedRefundPercent, setRequestedRefundPercent] = useState<
    number | ""
  >("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Arrays for file uploads (storing the upload ID)
  const [attachments, setAttachments] = useState<{ id: string; url: string; name: string; size: number }[]>(
    []
  );

  const isValid =
    clientClaim.trim().length > 10 &&
    typeof requestedRefundPercent === "number" &&
    requestedRefundPercent > 0 &&
    requestedRefundPercent <= 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const attachmentIds = attachments.map((a) => a.id);

      const result = await createDispute({
        bookingId: booking._id,
        clientClaim,
        requestedRefundPercent: Number(requestedRefundPercent),
        priority,
        clientAttachments: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      if (result.success) {
        toast.success("Dispute created successfully");
        router.refresh(); // Refresh the page to update booking state if needed
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to create dispute");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = (data: any) => {
    if (data && data._id && data.url) {
      setAttachments((prev) => [...prev, { id: data._id, url: data.url, name: data.originalName || "Attachment", size: data.size || 0 }]);
    }
  };

  const handleRemoveAttachment = (idToRemove: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== idToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="max-h-[92vh] w-full p-0 overflow-hidden sm:max-w-[550px] rounded-2xl shadow-none">
        
        {/* Header - Fixed */}
        <div className="bg-card px-6 py-5 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Open Dispute
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
            You are opening a dispute for booking <strong>{booking.eventDetails.title}</strong>. 
            Once submitted, our resolution center will review your claim along with the vendor.
          </DialogDescription>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 overflow-y-auto max-h-[calc(92vh-180px)] px-6 py-5">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientClaim" className="text-foreground">
                  Reason for dispute <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="clientClaim"
                  placeholder="Please describe why you are disputing this booking in detail..."
                  className="min-h-[120px] resize-none"
                  value={clientClaim}
                  onChange={(e) => setClientClaim(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters required. Detailed explanations help speed up your resolution.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refundPercent" className="text-foreground">
                    Requested Refund % <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="refundPercent"
                      type="number"
                      min={1}
                      max={100}
                      placeholder="e.g. 50"
                      value={requestedRefundPercent}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        if (val === "" || (val >= 1 && val <= 100)) {
                          setRequestedRefundPercent(val);
                        }
                      }}
                      disabled={isSubmitting}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-foreground">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    disabled={isSubmitting}
                    value={priority}
                    onValueChange={(val: "low" | "medium" | "high") =>
                      setPriority(val)
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 pb-4">
                <Label className="text-foreground">
                  Evidence Attachments (Optional)
                </Label>
                <p className="text-xs text-muted-foreground pb-2">
                  Upload photos, screenshots, or documents supporting your claim.
                </p>
                
                {/* List of currently uploaded attachments */}
                <div className="space-y-3 mb-4">
                  {attachments.map((file) => (
                    <FileUploadCard
                      key={file.id}
                      uploadedFile={file}
                      onRemove={() => handleRemoveAttachment(file.id)}
                    />
                  ))}

                  {/* Upload new attachment */}
                  {attachments.length < 5 && (
                    <FileUploadCard
                      key={`upload-${attachments.length}`}
                      onUploadComplete={handleUpload}
                      onUploadStart={() => setIsSubmitting(true)}
                      onUploadEnd={() => setIsSubmitting(false)}
                    />
                  )}
                  {attachments.length >= 5 && (
                    <p className="text-xs text-orange-500">Maximum 5 attachments allowed.</p>
                  )}
                </div>
              </div>
            </div>
            
             <div className="bg-card px-6 py-4 border-t flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"       
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Dispute
            </Button>
          </div>
          </ScrollArea>
        </form>
      </DialogContent>
    </Dialog>
  );
}
