"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/react-query/keys";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";
import {
  adjustUnifiedBooking,
  sendUnifiedBookingInvoice,
  updateUnifiedBookingStatus,
} from "@/lib/actions/booking";
import type {
  AdjustUnifiedBookingInput,
  BookingResponse,
  PricingType,
} from "@/types/booking";

type LineItemInput = {
  description: string;
  amount: string;
};

type UnifiedBookingActionsProps = {
  booking: BookingResponse;
};

const pricingTypeLabels: Record<PricingType, string> = {
  hourly_rate: "Hourly rate",
  package_pricing: "Package pricing",
  custom_quotes: "Custom quotes",
};

export function UnifiedBookingActions({ booking }: UnifiedBookingActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedAdjustments, setHasSavedAdjustments] = useState(false);
  const [actualServiceHours, setActualServiceHours] = useState<string>("");
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [extraLineItems, setExtraLineItems] = useState<LineItemInput[]>([
    { description: "", amount: "" },
  ]);

  const pricingType = useMemo<PricingType>(() => {
    return booking.pricingType ?? "custom_quotes";
  }, [booking.pricingType]);

  const refreshBooking = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.detail(booking._id),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    router.refresh();
  };

  const handleConfirmAvailability = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUnifiedBookingStatus(booking._id);
      if (!result.success) {
        throw new Error(result.error || "Failed to confirm availability");
      }
      toast.success("Availability confirmed. You can now review pricing.");
      await refreshBooking();
    } catch (error) {
      toast.error("Unable to confirm availability", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildAdjustPayload = (): AdjustUnifiedBookingInput | null => {
    if (pricingType === "hourly_rate") {
      const hours = Number(actualServiceHours);
      if (!hours || Number.isNaN(hours) || hours <= 0) {
        toast.error("Enter the actual service hours before saving.");
        return null;
      }
      return { actualServiceHours: hours };
    }

    if (pricingType === "package_pricing") {
      const items = extraLineItems
        .map((item) => ({
          description: item.description.trim(),
          amount: Number(item.amount),
        }))
        .filter((item) => item.description && item.amount > 0);

      if (items.length === 0) {
        toast.error("Add at least one line item adjustment.");
        return null;
      }

      return { extraLineItems: items };
    }

    const price = Number(finalPrice);
    if (!price || Number.isNaN(price) || price <= 0) {
      toast.error("Enter the final price before saving.");
      return null;
    }
    return { finalPrice: price };
  };

  const handleSaveAdjustments = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    const payload = buildAdjustPayload();
    if (!payload) return;

    setIsSubmitting(true);
    try {
      const result = await adjustUnifiedBooking(booking._id, payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to save adjustments");
      }
      toast.success("Pricing adjustments saved.");
      setHasSavedAdjustments(true);
      await refreshBooking();
    } catch (error) {
      toast.error("Unable to save adjustments", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendUnifiedBookingInvoice(booking._id);
      if (!result.success) {
        throw new Error(result.error || "Failed to send invoice");
      }
      toast.success("Final invoice sent to the customer.");
      await refreshBooking();
    } catch (error) {
      toast.error("Unable to send invoice", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLineItem = () => {
    setExtraLineItems((prev) => [...prev, { description: "", amount: "" }]);
  };

  const updateLineItem = (index: number, field: "description" | "amount", value: string) => {
    setExtraLineItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const removeLineItem = (index: number) => {
    setExtraLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  if (booking.status === "pending") {
    return (
      <section className="rounded-xl border bg-muted/30 p-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Vendor Actions</h2>
          <p className="text-sm text-muted-foreground">
            Confirm you are available for this request to start the pricing review.
          </p>
          <Button onClick={handleConfirmAvailability} disabled={isSubmitting || Boolean(restriction)}>
            Confirm Availability
          </Button>
        </div>
      </section>
    );
  }

  if (booking.status !== "reviewing") {
    return null;
  }

  return (
    <section className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pricing Review</h2>
          <p className="text-xs text-muted-foreground">
            Pricing type: {pricingTypeLabels[pricingType]}
          </p>
        </div>
      </div>

      <Separator />

      {pricingType === "hourly_rate" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Actual service hours
          </label>
          <Input
            type="number"
            min={1}
            step={0.5}
            value={actualServiceHours}
            onChange={(event) => setActualServiceHours(event.target.value)}
            placeholder="e.g., 6"
          />
          <p className="text-xs text-muted-foreground">
            Set the final hours used for the job.
          </p>
        </div>
      )}

      {pricingType === "package_pricing" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Extra line items
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </div>
          {extraLineItems.map((item, index) => (
            <div
              key={`line-item-${index}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Line item {index + 1}
                </p>
                {extraLineItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <Textarea
                rows={2}
                placeholder="Describe the adjustment"
                value={item.description}
                onChange={(event) =>
                  updateLineItem(index, "description", event.target.value)
                }
              />
              <Input
                type="number"
                min={1}
                placeholder="Amount"
                value={item.amount}
                onChange={(event) => updateLineItem(index, "amount", event.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {pricingType === "custom_quotes" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Final price</label>
          <Input
            type="number"
            min={1}
            value={finalPrice}
            onChange={(event) => setFinalPrice(event.target.value)}
            placeholder="e.g., 2500"
          />
          <p className="text-xs text-muted-foreground">
            Set the final quoted price for the customer.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSaveAdjustments} disabled={isSubmitting || Boolean(restriction)}>
          Save Adjustments
        </Button>
        {hasSavedAdjustments && (
          <Button variant="outline" onClick={handleSendInvoice} disabled={isSubmitting || Boolean(restriction)}>
            Send Final Invoice
          </Button>
        )}
      </div>

      <VendorActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={setShowBlockedDialog}
        restriction={restriction}
      />
    </section>
  );
}
