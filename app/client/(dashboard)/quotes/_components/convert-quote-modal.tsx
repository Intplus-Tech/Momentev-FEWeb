"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { CustomerQuote } from "@/types/quote";
import { createBookingFromQuote } from "@/lib/actions/booking";
import { respondToQuote } from "@/lib/actions/client-quotes";
import { queryKeys } from "@/lib/react-query/keys";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConvertQuoteModalProps {
  quote: CustomerQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertQuoteModal({
  quote,
  open,
  onOpenChange,
}: ConvertQuoteModalProps) {
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!quote) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // If the quote is just "sent", accept it first seamlessly behind the scenes
      if (quote.status === "sent") {
        const acceptRes = await respondToQuote(quote._id, {
          decision: "accept",
        });
        if (!acceptRes.success) {
          toast.error(acceptRes.error || "Failed to accept quote before booking.");
          setIsSubmitting(false);
          return;
        }
      }

      const res = await createBookingFromQuote(
        quote._id,
        location.trim() || undefined
      );

      if (!res.success) {
        toast.error(res.error || "Failed to create booking");
        return;
      }

      toast.success("Booking successfully created!");
      
      // Invalidate queries so dashboards update
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });
      
      onOpenChange(false);
      
      // Redirect to the bookings page to view the newly created booking
      router.push("/client/bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingLocation = quote.quoteRequestId.customerRequestId?.eventDetails?.location;

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-none border">
        <DialogHeader>
          <DialogTitle>
            {quote.status === "sent" ? "Accept Quote & Book Vendor" : "Confirm Booking"}
          </DialogTitle>
          <DialogDescription className="pt-2">
            You are about to securely {quote.status === "sent" ? "accept this quote and " : ""}book this vendor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Event Location (Optional Update)
            </label>
            <p className="text-xs text-muted-foreground pb-1">
              {existingLocation
                ? `Current location is "${existingLocation}". Enter a new address here if you need to update it for this specific vendor, otherwise leave empty.`
                : "You didn't specify a physical location initially. If applicable, provide the venue address."}
            </p>
            <Input
              id="location"
              placeholder="e.g., 123 Main St, London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-none"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {quote.status === "sent" ? "Accept & Book" : "Confirm & Book Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
