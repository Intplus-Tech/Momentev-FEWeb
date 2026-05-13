"use client";

import type {
  QuoteRequestStatus,
  VendorQuoteRequest,
} from "@/types/quote-request";
import type { VendorQuoteResponse } from "@/types/quote";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
} from "lucide-react";

import {
  formatLongDate,
  formatReceivedTime,
  formatRelativeExpiry,
  isQuoteRequestExpired,
  isQuoteRequestExpiringSoon,
} from "./requests-utils";
import { PermissionActionGate } from "@/components/auth/permission-gate";

const stageStyles: Record<QuoteRequestStatus, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "border border-[#cfd8ff] bg-[#eef2ff] text-[#2F6BFF]",
  },
  responded: {
    label: "RESPONDED",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  accepted: {
    label: "ACCEPTED",
    className: "border border-sky-200 bg-sky-50 text-sky-600",
  },
  completed: {
    label: "COMPLETED",
    className: "border border-green-200 bg-green-50 text-green-700",
  },
  expired: {
    label: "EXPIRED",
    className: "border border-amber-200 bg-amber-50 text-amber-600",
  },
  closed: {
    label: "CLOSED",
    className: "border border-zinc-200 bg-zinc-50 text-zinc-500",
  },
};

export function RequestCardSkeleton() {
  return (
    <Card className="rounded-3xl border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </Card>
  );
}

interface RequestCardProps {
  request: VendorQuoteRequest;
  existingDraft?: VendorQuoteResponse | null;
  onCreateQuote: (request: VendorQuoteRequest) => void;
  onEditDraft: (draft: VendorQuoteResponse) => void;
}

export function RequestCard({
  request,
  existingDraft,
  onCreateQuote,
  onEditDraft,
}: RequestCardProps) {
  const cr = request.customerRequestId;
  const status = request.status;
  const style = stageStyles[status] ?? {
    label: status.toUpperCase(),
    className: "border border-gray-200 bg-gray-50 text-gray-500",
  };

  const isExpired = isQuoteRequestExpired(status, request.expiresAt);
  const isExpiringSoon = isQuoteRequestExpiringSoon(status, request.expiresAt);

  const customerName =
    `${cr?.customerId?.firstName ?? ""} ${cr?.customerId?.lastName ?? ""}`.trim() ||
    request.customerId?.email;

  const budget = cr?.budgetAllocations?.reduce(
    (sum, b) => sum + (b.budgetedAmount ?? 0),
    0
  );

  const attachments = (cr?.attachments ?? [])
    .map((attachment) =>
      typeof attachment === "string"
        ? { url: attachment, label: "Attachment" }
        : {
          url: attachment?.url,
          label: attachment?.originalName || "Attachment",
        }
    )
    .filter((attachment): attachment is { url: string; label: string } => Boolean(attachment.url));

  return (
    <Card className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {request.expiresAt && isExpiringSoon && !isExpired && (
            <div className="flex items-center gap-2 mr-2">
              <span className="rounded-md bg-[#FFDADA] px-2.5 py-0.5 text-[12px] font-medium text-[#E03131]">
                Urgent!
              </span>
              <span className="flex items-center gap-1.5 text-[13.5px] text-[#E03131] font-medium">
                <Clock className="h-4 w-4" />
                {formatRelativeExpiry(request.expiresAt)}
              </span>
            </div>
          )}
          {request.expiresAt && isExpired && (
            <span className="rounded-md bg-[#FFDADA] px-2.5 py-0.5 text-[12px] font-medium text-[#E03131]">
              Expired
            </span>
          )}
          {!isExpiringSoon && !isExpired && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                style.className
              )}
            >
              {style.label}
            </span>
          )}
          {cr?.serviceCategoryId?.name && (
            <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 capitalize bg-white">
              {cr.serviceCategoryId.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Received {formatReceivedTime(request.createdAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{customerName}</p>
            <p className="text-sm text-gray-500">{request.customerId?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {cr?.eventDetails?.startDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[#2F6BFF]" />
                  {formatLongDate(cr.eventDetails.startDate)}
                </span>
              )}
              {cr?.eventDetails?.guestCount != null && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#2F6BFF]" />
                  {cr.eventDetails.guestCount} guests
                </span>
              )}
            </div>
            {budget != null && budget > 0 && (
              <p className="mt-2 text-[14px] font-medium text-primary">
                Budget: £{budget.toLocaleString()}
              </p>
            )}
          </div>
          {cr?.eventDetails?.description && (
            <div className="rounded-[16px] bg-[#F8F9FA] px-5 py-4 text-sm text-gray-500 leading-relaxed">
              &quot;{cr.eventDetails.description}&quot;
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-[16px] bg-[#F8F9FA] p-5">
          <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500">
            Event
          </p>
          <p className="text-[15px] font-semibold text-gray-900">
            {cr?.eventDetails?.title ?? "—"}
          </p>
          {cr?.eventDetails?.location && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-600">
              <MapPin className="h-4 w-4 text-[#2F6BFF]" />
              {cr.eventDetails.location}
            </div>
          )}
          {request.expiresAt && !isExpiringSoon && !isExpired && (
            <p className="mt-2 text-[13px] text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeExpiry(request.expiresAt)}
            </p>
          )}

          {attachments.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-gray-500">
                <FileText className="h-3.5 w-3.5" />
                Attachments
              </p>
              <div className="space-y-1.5">
                {attachments.map((attachment, index) => (
                  <a
                    key={`${attachment.url}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md bg-white px-2.5 py-2 text-[12px] text-gray-700 hover:bg-gray-100"
                  >
                    <span className="truncate pr-2">
                      {attachment.label}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {status !== "responded" && !isExpired && (
          <>
            {existingDraft ? (
              <>
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  ✎ Draft in progress
                </div>
                <PermissionActionGate module="view_orders" action="write">
                  <Button
                    onClick={() => onEditDraft(existingDraft)}
                    className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] shadow-none"
                  >
                    Continue Draft
                  </Button>
                </PermissionActionGate>
              </>
            ) : (
              <PermissionActionGate module="view_orders" action="write">
                <Button
                  onClick={() => onCreateQuote(request)}
                  className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium bg-[#2F6BFF] text-white hover:bg-[#1e4dcc] shadow-none"
                >
                  Create Quote
                </Button>
              </PermissionActionGate>
            )}
          </>
        )}
        {status !== "responded" && !isExpired && (
          <PermissionActionGate module="view_orders" action="write">
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 h-auto text-[13.5px] font-medium border-red-100 bg-red-50 text-red-500 hover:bg-red-100 shadow-none hover:text-red-600 border-none"
            >
              Decline
            </Button>
          </PermissionActionGate>
        )}
      </div>
    </Card>
  );
}
