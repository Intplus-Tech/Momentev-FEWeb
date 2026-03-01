"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import type { CustomerQuote, QuoteDecision } from "@/types/quote";
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
import { Textarea } from "@/components/ui/textarea";

interface RespondQuoteModalProps {
  quote: CustomerQuote | null;
  decision: QuoteDecision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RespondQuoteModal({
  quote,
  decision,
  open,
  onOpenChange,
}: RespondQuoteModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!quote || !decision) return null;

  const titles: Record<QuoteDecision, string> = {
    accept: "Accept Quote",
    decline: "Decline Quote",
    request_changes: "Request Changes",
  };

  const descriptions: Record<QuoteDecision, string> = {
    accept: "Are you sure you want to accept this quote? This will confirm the pricing and terms with the vendor.",
    decline: "Are you sure you want to decline this quote? The vendor will be notified and this request will be closed.",
    request_changes: "What changes would you like to request? Please provide details so the vendor can revise their quote.",
  };

  const actionText: Record<QuoteDecision, string> = {
    accept: "Accept Quote",
    decline: "Decline Quote",
    request_changes: "Send Request",
  };

  const actionVariant: Record<QuoteDecision, "default" | "destructive" | "secondary"> = {
    accept: "default",
    decline: "destructive",
    request_changes: "secondary",
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await respondToQuote(quote._id, {
        decision,
        customerNote: note.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || `Failed to ${decision.replace("_", " ")} quote`);
        return;
      }

      toast.success(`Quote successfully ${decision === "accept" ? "accepted" : decision === "decline" ? "declined" : "sent back for changes"}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });
      onOpenChange(false);
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-none border">
        <DialogHeader>
          <DialogTitle>{titles[decision]}</DialogTitle>
          <DialogDescription className="pt-2">
            {descriptions[decision]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium text-foreground">
              Add a note {decision === "request_changes" ? "(Required)" : "(Optional)"}
            </label>
            <Textarea
              id="note"
              placeholder={
                decision === "request_changes"
                  ? "E.g., Can you update the quote to include an extra hour of coverage?"
                  : "Any message for the vendor?"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-24 rounded-xl"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={actionVariant[decision]}
            onClick={handleSubmit}
            disabled={isSubmitting || (decision === "request_changes" && !note.trim())}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionText[decision]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
