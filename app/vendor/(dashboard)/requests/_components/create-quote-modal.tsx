"use client";

import { useState, useCallback, useId, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Trash2, Loader2, Send, Save } from "lucide-react";

import { createQuoteDraft, updateQuoteDraft, sendQuote, reviseQuote } from "@/lib/actions/quotes";
import { queryKeys } from "@/lib/react-query/keys";
import type { QuoteLineItem, ValidityDuration, QuoteDraft, VendorQuoteResponse } from "@/types/quote";
import type { VendorQuoteRequest } from "@/types/quote-request";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALIDITY_OPTIONS: { label: string; value: ValidityDuration }[] = [
  { label: "7 Days", value: "7_days" },
  { label: "14 Days", value: "14_days" },
  { label: "30 Days", value: "30_days" },
  { label: "Custom date", value: "custom" },
];

const emptyLineItem = (): QuoteLineItem => ({
  service: "",
  quantity: 1,
  hours: 1,
  rate: 0,
  subtotal: 0,
});

const calcSubtotal = (item: QuoteLineItem) =>
  Number((item.quantity * item.hours * item.rate).toFixed(2));

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

// ─── Sub-component: Line Item Row ────────────────────────────────────────────

interface LineItemRowProps {
  item: QuoteLineItem;
  index: number;
  canRemove: boolean;
  onChange: (index: number, updated: QuoteLineItem) => void;
  onRemove: (index: number) => void;
}

function LineItemRow({ item, index, canRemove, onChange, onRemove }: LineItemRowProps) {
  const handleField = (field: keyof QuoteLineItem, value: string) => {
    const updated = { ...item, [field]: field === "service" ? value : Number(value) };
    const subtotal = calcSubtotal(updated);
    onChange(index, { ...updated, subtotal });
  };

  return (
    <div className="grid grid-cols-[1fr_68px_68px_80px_88px_36px] gap-2 items-center">
      <Input
        placeholder="Service description"
        value={item.service}
        onChange={(e) => handleField("service", e.target.value)}
        className="text-sm"
      />
      <Input
        type="number"
        min={1}
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => handleField("quantity", e.target.value)}
        className="text-sm text-center"
      />
      <Input
        type="number"
        min={0}
        step={0.5}
        placeholder="Hrs"
        value={item.hours}
        onChange={(e) => handleField("hours", e.target.value)}
        className="text-sm text-center"
      />
      <Input
        type="number"
        min={0}
        step={0.01}
        placeholder="Rate"
        value={item.rate}
        onChange={(e) => handleField("rate", e.target.value)}
        className="text-sm text-right"
      />
      <div className="text-right text-sm font-medium text-gray-700 pr-1">
        {formatGBP(item.subtotal)}
      </div>
      <button
        type="button"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
        className={cn(
          "flex items-center justify-center rounded-md h-8 w-8 text-gray-400",
          canRemove ? "hover:text-red-500 hover:bg-red-50" : "opacity-30 cursor-not-allowed"
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

interface CreateQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: VendorQuoteRequest | null;
  draftQuote?: VendorQuoteResponse | null;
  isRevision?: boolean;
}

export function CreateQuoteModal({ open, onOpenChange, request, draftQuote, isRevision }: CreateQuoteModalProps) {
  const uid = useId();
  const queryClient = useQueryClient();

  // Form state
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([emptyLineItem()]);
  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [validityDuration, setValidityDuration] = useState<ValidityDuration>("7_days");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  // Tracks a saved draft _id so subsequent saves use PATCH instead of POST
  const [draftId, setDraftId] = useState<string | null>(null);

  // Loading states
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);

  // Derived
  const total = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const balancePercent = 100 - depositPercent;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLineItemChange = useCallback(
    (index: number, updated: QuoteLineItem) =>
      setLineItems((prev) => prev.map((item, i) => (i === index ? updated : item))),
    []
  );

  const handleAddRow = () => setLineItems((prev) => [...prev, emptyLineItem()]);

  const handleRemoveRow = useCallback(
    (index: number) =>
      setLineItems((prev) => prev.filter((_, i) => i !== index)),
    []
  );

  const handleDepositChange = (value: string) => {
    const n = Math.min(100, Math.max(0, Number(value)));
    setDepositPercent(n);
  };

  const resetForm = useCallback(() => {
    if (draftQuote) {
      setLineItems(draftQuote.lineItems?.length ? draftQuote.lineItems : [emptyLineItem()]);
      setDepositPercent(draftQuote.paymentTerms?.depositPercent ?? 50);
      setValidityDuration(draftQuote.validityDuration ?? "7_days");
      setCustomExpiryDate(
        draftQuote.customExpiryDate 
          ? new Date(draftQuote.customExpiryDate).toISOString().slice(0, 16) 
          : ""
      );
      setPersonalMessage(draftQuote.personalMessage ?? "");
      setDraftId(draftQuote._id);
    } else {
      setLineItems([emptyLineItem()]);
      setDepositPercent(50);
      setValidityDuration("7_days");
      setCustomExpiryDate("");
      setPersonalMessage("");
      setDraftId(null);
    }
  }, [draftQuote]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const buildPayload = () => ({
    quoteRequestId: request?._id || draftQuote?.quoteRequestId?._id || "",
    lineItems,
    currency: "GBP" as const,
    total: Number(total.toFixed(2)),
    paymentTerms: { depositPercent, balancePercent },
    validityDuration,
    ...(validityDuration === "custom" && customExpiryDate
      ? { customExpiryDate: new Date(customExpiryDate).toISOString() }
      : {}),
    ...(personalMessage.trim() ? { personalMessage: personalMessage.trim() } : {}),
  });

  const validate = () => {
    if (!request && !draftQuote) return "No request selected.";
    if (lineItems.some((item) => !item.service.trim()))
      return "All line items must have a service description.";
    if (lineItems.some((item) => item.rate <= 0))
      return "All line items must have a rate greater than 0.";
    if (total <= 0) return "Quote total must be greater than 0.";
    if (depositPercent < 0 || depositPercent > 100)
      return "Deposit % must be between 0 and 100.";
    if (validityDuration === "custom" && !customExpiryDate)
      return "Please select a custom expiry date.";
    return null;
  };

  // ── Save Draft ─────────────────────────────────────────────────────────────

  const handleSaveDraft = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSavingDraft(true);
    try {
      let result: { success: boolean; data?: QuoteDraft; error?: string };

      if (draftId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { quoteRequestId, ...patch } = buildPayload();
        result = await updateQuoteDraft(draftId, patch);
      } else {
        result = await createQuoteDraft(buildPayload());
      }

      if (!result.success) {
        toast.error(result.error ?? "Failed to save draft.");
        return;
      }

      if (result.data?._id) setDraftId(result.data._id);
      
      // Invalidate relevant queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });
      
      toast.success("Draft saved successfully.");
    } finally {
      setSavingDraft(false);
    }
  };

  // ── Send Quote ────────────────────────────────────────────────────────────

  const handleSendQuote = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSending(true);
    try {
      let quoteId = draftId;

      // Create draft first if we don't have one yet
      if (!quoteId) {
        const createResult = await createQuoteDraft(buildPayload());
        if (!createResult.success || !createResult.data) {
          toast.error(createResult.error ?? "Failed to create quote draft.");
          return;
        }
        quoteId = createResult.data._id;
        setDraftId(quoteId);
      }

      const sendResult = await sendQuote(quoteId);
      if (!sendResult.success) {
        toast.error(sendResult.error ?? "Failed to send quote.");
        return;
      }

      // Invalidate relevant queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });

      toast.success("Quote sent to the customer successfully!");
      onOpenChange(false);
      resetForm();
    } finally {
      setSending(false);
    }
  };

  // ── Revise Quote ──────────────────────────────────────────────────────────

  const handleReviseQuote = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    if (!draftQuote) return;

    setSending(true);
    try {
      const result = await reviseQuote(draftQuote._id, buildPayload());
      if (!result.success) {
        toast.error(result.error ?? "Failed to submit revision.");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteRequests.all });
      
      toast.success("Revision sent successfully!");
      onOpenChange(false);
      resetForm();
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeEvent = request?.customerRequestId?.eventDetails 
    || draftQuote?.quoteRequestId?.customerRequestId?.eventDetails;
  
  const customerDoc = request?.customerId || draftQuote?.quoteRequestId?.customerRequestId?.customerId;
  
  const eventTitle = activeEvent?.title ?? "Quote Request";
  const customerName = customerDoc ? [
    // @ts-expect-error Types might miss firstName/lastName based on population depth
      customerDoc.firstName,
    // @ts-expect-error
      customerDoc.lastName,
    ]
      .filter(Boolean)
      .join(" ") 
    : "Customer";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-full overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isRevision ? "Revise Quote" : (draftQuote ? "Edit Quote Draft" : "Create Quote")}
          </DialogTitle>
          {(request || draftQuote) && (
            <p className="text-sm text-gray-500">
              For <span className="font-medium text-gray-700">{customerName}</span>
              {" · "}
              <span className="italic">{eventTitle}</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Line Items ─────────────────────────────────────── */}
          <section>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
              Line Items
            </h3>

            {/* Column headers */}
            <div className="mb-1.5 grid grid-cols-[1fr_68px_68px_80px_88px_36px] gap-2 px-0">
              {["Service", "Qty", "Hours", "Rate (£)", "Subtotal", ""].map((h) => (
                <span key={h} className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <LineItemRow
                  key={`${uid}-${index}`}
                  item={item}
                  index={index}
                  canRemove={lineItems.length > 1}
                  onChange={handleLineItemChange}
                  onRemove={handleRemoveRow}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="mt-3 flex items-center gap-1.5 text-[13px] text-[#2F6BFF] hover:text-[#1e4dcc]"
            >
              <PlusCircle className="h-4 w-4" />
              Add line item
            </button>
          </section>

          <Separator />

          {/* ── Total ─────────────────────────────────────────── */}
          <section className="flex items-center justify-between rounded-[14px] bg-[#F8F9FA] px-5 py-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500">
                Total (GBP)
              </p>
              <p className="text-2xl font-bold text-gray-900">{formatGBP(total)}</p>
            </div>
            <p className="text-[13px] text-gray-400">Currency: GBP £</p>
          </section>

          <Separator />

          {/* ── Payment Terms ─────────────────────────────────── */}
          <section>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
              Payment Terms
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${uid}-deposit`}>Deposit (%)</Label>
                <Input
                  id={`${uid}-deposit`}
                  type="number"
                  min={0}
                  max={100}
                  value={depositPercent}
                  onChange={(e) => handleDepositChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Balance (%)</Label>
                <div className="flex h-10 items-center rounded-md border border-gray-200 bg-[#F8F9FA] px-3 text-sm text-gray-600">
                  {balancePercent}%
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Validity ──────────────────────────────────────── */}
          <section>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
              Quote Validity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${uid}-validity`}>Duration</Label>
                <Select
                  value={validityDuration}
                  onValueChange={(v) => setValidityDuration(v as ValidityDuration)}
                >
                  <SelectTrigger id={`${uid}-validity`}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {validityDuration === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor={`${uid}-expiry`}>Expiry Date & Time</Label>
                  <Input
                    id={`${uid}-expiry`}
                    type="datetime-local"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* ── Personal Message ─────────────────────────────── */}
          <section className="space-y-2">
            <Label htmlFor={`${uid}-message`}>Personal Message</Label>
            <Textarea
              id={`${uid}-message`}
              placeholder="Hi! I'd love to help make your event unforgettable…"
              rows={3}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="resize-none text-sm"
            />
          </section>
        </div>

        <DialogFooter className="flex-col gap-2 pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          {isRevision ? (
            <Button
              type="button"
              disabled={sending}
              onClick={handleReviseQuote}
              className="w-full bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] sm:w-auto"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Revision
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={savingDraft || sending}
                onClick={handleSaveDraft}
                className="w-full border-[#2F6BFF] text-[#2F6BFF] hover:bg-[#eef2ff] sm:w-auto"
              >
                {savingDraft ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {draftId ? "Update Draft" : "Save Draft"}
              </Button>

              <Button
                type="button"
                disabled={savingDraft || sending}
                onClick={handleSendQuote}
                className="w-full bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] sm:w-auto"
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Quote
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
