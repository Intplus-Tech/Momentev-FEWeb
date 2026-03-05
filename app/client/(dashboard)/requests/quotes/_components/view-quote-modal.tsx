"use client";

import { useId } from "react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { Clock, MapPin, Users, CalendarDays, ExternalLink, FileText } from "lucide-react";

import type { CustomerQuote } from "@/types/quote";
import { useVendorDetails } from "@/hooks/api/use-vendors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  sent: { bg: "bg-blue-50", text: "text-blue-700", label: "Received" },
  accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
  declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  changes_requested: { bg: "bg-amber-50", text: "text-amber-700", label: "Changes Requested" },
  revised: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Revised" },
  expired: { bg: "bg-gray-100", text: "text-gray-500", label: "Expired" },
  withdrawn: { bg: "bg-slate-100", text: "text-slate-500", label: "Withdrawn" },
};

const formatCurrency = (val: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(val);

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
  quote: CustomerQuote | null;
}

export function ViewQuoteModal({ open, onOpenChange, quote }: ViewQuoteModalProps) {
  const uid = useId();

  const { data: vendorRes, isLoading: isLoadingVendor } = useVendorDetails(quote?.vendorId?._id ?? null);
  const vendor = vendorRes?.data;

  if (!quote) return null;

  const request = quote.quoteRequestId;
  const event = request?.customerRequestId?.eventDetails;
  const statusDef = statusStyles[quote.status] ?? {
    bg: "bg-gray-50", text: "text-gray-700", label: quote.status.toUpperCase()
  };

  const isUrgent =
    quote.expiresAt &&
    new Date(quote.expiresAt) > new Date() &&
    differenceInHours(new Date(quote.expiresAt), new Date()) < 48;
    
  const isExpired = quote.expiresAt && new Date(quote.expiresAt) <= new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full p-0 overflow-hidden sm:max-w-3xl rounded-2xl shadow-none">
        
        {/* Header - Fixed */}
        <div className="bg-card px-6 py-5 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">
                Quote Details
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                From 
                {isLoadingVendor ? (
                  <Skeleton className="h-4 w-24 inline-block" />
                ) : (
                  <span className="font-semibold text-foreground">
                    {vendor?.businessProfile?.businessName ?? `Vendor #${quote.vendorId?._id?.slice(-6)}`}
                  </span>
                )}
                <span>·</span>
                <span className="italic">{event?.title ?? "Event"}</span>
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[12px] font-bold tracking-wide uppercase border",
                  statusDef.bg,
                  statusDef.text
                )}
              >
                {statusDef.label}
              </span>
              <p className="text-[12px] font-medium text-muted-foreground">
                Received {format(new Date(quote.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <ScrollArea className="px-6 py-6 max-h-[calc(92vh-140px)]">
          <div className="space-y-8 pb-4">
            
            {/* ── Event Details ─────────────────────────────────────── */}
            <section>
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-primary">
                Event Information
              </h3>
              
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
                {event?.description && (
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                      Description
                    </span>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-foreground">
                      {event.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {event?.startDate && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Dates</span>
                      </div>
                      <p className="text-[14px] font-medium text-foreground">
                        {format(new Date(event.startDate), "MMM d, yyyy")}
                        {event.endDate && ` - ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  )}
                  {event?.guestCount && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Guests</span>
                      </div>
                      <p className="text-[14px] font-medium text-foreground">
                        {event.guestCount}
                      </p>
                    </div>
                  )}
                  {event?.location && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-4" />
                        <span className="text-[12px] font-medium uppercase tracking-wide">Location</span>
                      </div>
                      <p className="text-[14px] font-medium text-foreground">
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
                 <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-primary">
                  Message from Vendor
                </h3>
                <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10">
                  <p className="text-[14px] leading-relaxed text-foreground italic">
                    "{quote.personalMessage}"
                  </p>
                </div>
              </section>
            )}

            {/* ── Quote Financials ──────────────────────────────────── */}
            <section>
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-primary">
                Line Items & Financials
              </h3>
              
              <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {/* Headers */}
                <div className="grid grid-cols-[1fr_80px_100px] gap-4 bg-muted/50 px-5 py-3 border-b">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Qty/Hrs</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Subtotal</span>
                </div>
                
                {/* Items */}
                <div className="divide-y">
                  {quote.lineItems?.map((item, i) => (
                    <div key={`${uid}-${i}`} className="grid grid-cols-[1fr_80px_100px] gap-4 px-5 py-4 items-center">
                      <span className="text-[14px] font-medium text-foreground">{item.service}</span>
                      <span className="text-[13px] text-muted-foreground text-center">
                        {item.quantity}x • {item.hours}h
                      </span>
                      <span className="text-[14px] font-semibold text-foreground text-right">
                        {formatCurrency(item.subtotal, quote.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Totals */}
                <div className="bg-muted/30 px-5 py-4 border-t">
                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Total Quoted
                        </p>
                        <p className="text-2xl font-black text-foreground tracking-tight">
                          {formatCurrency(quote.total, quote.currency)}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[12px] font-medium text-muted-foreground">
                          <span className="font-semibold text-foreground">Deposit:</span> {quote.paymentTerms?.depositPercent}%
                        </p>
                        <p className="text-[12px] font-medium text-muted-foreground">
                          <span className="font-semibold text-foreground">Balance:</span> {quote.paymentTerms?.balancePercent}%
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Validity / Expiration ─────────────────────────────── */}
            <section className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-[12px] font-bold uppercase tracking-widest text-primary">
                    Quote Expiration
                  </span>
                </div>
                
                {quote.expiresAt ? (
                  <>
                    <p className="text-[15px] font-medium text-foreground">
                       {format(new Date(quote.expiresAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {isUrgent && !isExpired && (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                          Expiring Soon
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
                  <p className="text-[14px] text-muted-foreground">No expiration date set.</p>
                )}
              </div>
              
              {/* Attachments (If any) */}
              {/* @ts-expect-error Backend returns attachments but interface is missing it */}
              {request?.customerRequestId?.attachments && request.customerRequestId.attachments.length > 0 && (
                 <div className="flex-1 rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="text-[12px] font-bold uppercase tracking-widest text-primary">
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
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                        >
                           <span className="text-[13px] font-medium text-foreground truncate mr-2">
                              Attachment {i + 1}
                           </span>
                           <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                        </a>
                      ))}
                    </div>
                 </div>
              )}
            </section>
            
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="bg-card px-6 py-4 border-t flex justify-end">
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             className="rounded-full px-6 shadow-none"
           >
             Close
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
