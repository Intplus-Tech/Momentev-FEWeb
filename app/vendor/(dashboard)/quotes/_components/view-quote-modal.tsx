"use client";

import { useId } from "react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { Clock, MapPin, Users, CalendarDays, ExternalLink, FileText } from "lucide-react";

import type { VendorQuoteResponse, QuoteStatus } from "@/types/quote";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", label: "Sent" },
  accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
  declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  changes_requested: { bg: "bg-amber-50", text: "text-amber-700", label: "Changes Requested" },
  revised: { bg: "bg-blue-50", text: "text-blue-700", label: "Revised" },
  expired: { bg: "bg-red-50", text: "text-red-700", label: "Expired" },
  withdrawn: { bg: "bg-gray-100", text: "text-gray-500", label: "Withdrawn" },
  converted: { bg: "bg-green-100", text: "text-green-800", label: "Converted" },
};

const formatGBP = (val: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(val);

function formatRelativeExpiry(dateString?: string) {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  
  if (expiry < now) return "Expired";
  
  const diffHours = differenceInHours(expiry, now);
  if (diffHours < 24) {
    if (diffHours === 0) return "Expires in < 1 hour";
    return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }
  
  const diffDays = differenceInDays(expiry, now);
  if (diffDays === 1) return "Expires tomorrow";
  return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface ViewQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: VendorQuoteResponse | null;
}

export function ViewQuoteModal({ open, onOpenChange, quote }: ViewQuoteModalProps) {
  const uid = useId();

  if (!quote) return null;

  const request = quote.quoteRequestId;
  const event = request?.customerRequestId?.eventDetails;
  const statusDef = statusStyles[quote.status] ?? statusStyles.draft;
  
  const customerName = [
    quote.customerId?.firstName, 
    quote.customerId?.lastName
  ]
    .filter(Boolean)
    .join(" ") || quote.customerId?.email || "Customer";
    
  // Check if it's urgent (expires in < 24 hours)
  const isUrgent =
    quote.expiresAt &&
    new Date(quote.expiresAt) > new Date() &&
    differenceInHours(new Date(quote.expiresAt), new Date()) < 24;
    
  const isExpired = quote.expiresAt && new Date(quote.expiresAt) <= new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full p-0 overflow-hidden sm:max-w-3xl rounded-[24px]">
        
        {/* Header - Fixed */}
        <div className="bg-gray-50/80 px-6 py-5 backdrop-blur border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 mb-1">
                Quote Details
              </DialogTitle>
              <p className="text-sm font-medium text-gray-500">
                For <span className="font-semibold text-gray-700">{customerName}</span>
                {" · "}
                <span className="italic">{event?.title ?? "Event"}</span>
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[12px] font-bold tracking-wide uppercase shadow-sm border border-black/5",
                  statusDef.bg,
                  statusDef.text
                )}
              >
                {statusDef.label}
              </span>
              <p className="text-[12px] font-medium text-gray-400">
                Created {format(new Date(quote.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <ScrollArea className="px-6 py-6 max-h-[calc(92vh-150px)]">
          <div className="space-y-8 pb-4">
            
            {/* ── Event Details ─────────────────────────────────────── */}
            <section>
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-[#2F6BFF]">
                Event Information
              </h3>
              
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
                {event?.description && (
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                      Description
                    </span>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-gray-700">
                      {event.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {event?.startDate && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <CalendarDays className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Dates</span>
                      </div>
                      <p className="text-[14px] font-medium text-gray-900">
                        {format(new Date(event.startDate), "MMM d, yyyy")}
                        {event.endDate && ` - ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  )}
                  {event?.guestCount && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Guests</span>
                      </div>
                      <p className="text-[14px] font-medium text-gray-900">
                        {event.guestCount}
                      </p>
                    </div>
                  )}
                  {event?.location && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Location</span>
                      </div>
                      <p className="text-[14px] font-medium text-gray-900">
                        {event.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Personal Message ──────────────────────────────────── */}
            {quote.personalMessage && (
              <section>
                 <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-[#2F6BFF]">
                  Your Message
                </h3>
                <div className="rounded-2xl bg-indigo-50/50 p-5 border border-indigo-100/50">
                  <p className="text-[14px] leading-relaxed text-indigo-900 italic">
                    "{quote.personalMessage}"
                  </p>
                </div>
              </section>
            )}

            {/* ── Quote Financials ──────────────────────────────────── */}
            <section>
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-[#2F6BFF]">
                Line Items & Financials
              </h3>
              
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Headers */}
                <div className="grid grid-cols-[1fr_80px_100px] gap-4 bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Service</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Qty / Hrs</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Subtotal</span>
                </div>
                
                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {quote.lineItems?.map((item, i) => (
                    <div key={`${uid}-${i}`} className="grid grid-cols-[1fr_80px_100px] gap-4 px-5 py-4 items-center">
                      <span className="text-[14px] font-medium text-gray-900">{item.service}</span>
                      <span className="text-[13px] text-gray-500 text-center">
                        {item.quantity}x • {item.hours}h
                      </span>
                      <span className="text-[14px] font-semibold text-gray-900 text-right">
                        {formatGBP(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Totals */}
                <div className="bg-[#F8F9FA] px-5 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Total Quoted
                        </p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">
                          {formatGBP(quote.total)}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[12px] font-medium text-gray-500">
                          <span className="font-semibold text-gray-700">Deposit:</span> {quote.paymentTerms?.depositPercent}%
                        </p>
                        <p className="text-[12px] font-medium text-gray-500">
                          <span className="font-semibold text-gray-700">Balance:</span> {quote.paymentTerms?.balancePercent}%
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Validity / Expiration ─────────────────────────────── */}
            <section className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-gray-400" />
                  <span className="text-[12px] font-bold uppercase tracking-widest text-[#2F6BFF]">
                    Quote Expiration
                  </span>
                </div>
                
                {quote.expiresAt ? (
                  <>
                    <p className="text-[15px] font-medium text-gray-900">
                       {format(new Date(quote.expiresAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {isUrgent && !isExpired && (
                        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          Urgent
                        </span>
                      )}
                      <span className={cn(
                        "text-[13px] font-medium",
                        isExpired ? "text-red-500" : "text-amber-600"
                      )}>
                        {isExpired ? "Expired" : formatRelativeExpiry(quote.expiresAt)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[14px] text-gray-500">No expiration date set.</p>
                )}
              </div>
              
              {/* Attachments (If any) */}
              {/* @ts-expect-error Backend returns attachments but interface is missing it */}
              {request?.customerRequestId?.attachments && request.customerRequestId.attachments.length > 0 && (
                 <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="size-4 text-gray-400" />
                      <span className="text-[12px] font-bold uppercase tracking-widest text-[#2F6BFF]">
                        Attachments
                      </span>
                    </div>
                    <div className="space-y-2">
                      {/* @ts-expect-error */}
                      {request.customerRequestId.attachments.map((url: string, i: number) => (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                           <span className="text-[13px] font-medium text-gray-700 truncate mr-2">
                              Attachment {i + 1}
                           </span>
                           <ExternalLink className="size-3.5 text-gray-400 group-hover:text-gray-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                 </div>
              )}
            </section>
            
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             className="rounded-full px-6 shadow-none font-medium text-gray-700 hover:bg-white"
           >
             Close
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
