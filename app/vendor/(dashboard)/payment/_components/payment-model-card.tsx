"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { setPaymentModel } from "@/lib/actions/payment";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { queryKeys } from "@/lib/react-query/keys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type PaymentModel = "upfront_payout" | "split_payout";

function normalizePaymentModel(value?: string): PaymentModel {
  return value === "split_payout" ? "split_payout" : "upfront_payout";
}

const PAYMENT_MODEL_OPTIONS: Array<{
  value: PaymentModel;
  title: string;
  description: string;
}> = [
  {
    value: "upfront_payout",
    title: "Upfront payout",
    description: "Client pays in advance and you receive the payout up front.",
  },
  {
    value: "split_payout",
    title: "Split payout",
    description: "Payout is split into scheduled parts based on booking flow.",
  },
];

export function PaymentModelCard() {
  const queryClient = useQueryClient();
  const profileQuery = useUserProfile();

  const currentModel = useMemo(
    () => normalizePaymentModel(profileQuery.data?.vendor?.paymentModel),
    [profileQuery.data?.vendor?.paymentModel],
  );

  const [selectedModel, setSelectedModel] = useState<PaymentModel>(currentModel);

  useEffect(() => {
    setSelectedModel(currentModel);
  }, [currentModel]);

  const updateModelMutation = useMutation({
    mutationFn: async (paymentModel: PaymentModel) => {
      const result = await setPaymentModel(paymentModel);
      if (!result.success) {
        throw new Error(result.error || "Failed to update payment model");
      }
      return paymentModel;
    },
    onSuccess: async (paymentModel) => {
      queryClient.setQueryData(queryKeys.auth.user(), (previousData: unknown) => {
        if (!previousData || typeof previousData !== "object") {
          return previousData;
        }

        const profile = previousData as {
          vendor?: {
            paymentModel?: string;
          };
        };

        return {
          ...profile,
          vendor: {
            ...profile.vendor,
            paymentModel,
          },
        };
      });

      toast.success("Payment model updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update payment model");
    },
  });

  const isUnchanged = selectedModel === currentModel;
  const currentModelLabel =
    currentModel === "upfront_payout" ? "Upfront payout" : "Split payout";

  return (
    <Card className="rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-white to-slate-50/70 p-6 shadow-none">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">Vendor Payment Model</h3>
            <p className="text-sm text-muted-foreground">
              Select how payouts are processed for your bookings.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700"
          >
            Current: {currentModelLabel}
          </Badge>
        </div>

        <RadioGroup
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value as PaymentModel)}
          className="space-y-3"
        >
          {PAYMENT_MODEL_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={
                "rounded-2xl border p-4 transition-all " +
                (selectedModel === option.value
                  ? "border-foreground/20 bg-white shadow-sm"
                  : "border-slate-200/80 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50")
              }
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="cursor-pointer space-y-1">
                  <p className="font-medium text-foreground">{option.title}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* <p className="text-xs text-muted-foreground">
            Allowed values: <code>upfront_payout</code> or <code>split_payout</code>
          </p> */}
          <Button
            onClick={() => updateModelMutation.mutate(selectedModel)}
            disabled={isUnchanged || updateModelMutation.isPending || profileQuery.isLoading}
            className="sm:min-w-44"
          >
            {updateModelMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update payment model"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
