import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { CustomerRequest } from "@/types/custom-request";
import { RequestActions } from "./RequestActions";

type RequestCardProps = {
  request: CustomerRequest;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{label}:</span> {value}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "draft":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "pending_approval":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatStatus = (s: string) => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles()}`}
    >
      {formatStatus(status)}
    </span>
  );
}

export function RequestCard({ request }: RequestCardProps) {
  const {
    _id,
    eventDetails,
    budgetAllocations,
    serviceCategoryId,
    status,
    createdAt,
  } = request;

  const totalBudget = budgetAllocations?.reduce?.(
    (sum, item) => sum + (item.budgetedAmount || 0),
    0,
  ) || 0;

  const attachments = request.attachments ?? [];

  return (
    <Card className="border">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <p>
              Posted:{" "}
              {createdAt ? format(new Date(createdAt), "MMMM d, yyyy") : "N/A"}
            </p>
            <StatusBadge status={status} />
            {/* <p>Request ID: {_id}</p> */}
          </div>
          <RequestActions requestId={_id} status={status} />
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {eventDetails?.title || "Untitled Event"}
            </p>
            <DetailRow
              label="Location"
              value={eventDetails?.location || "N/A"}
            />
            <DetailRow
              label="Budget"
              value={`£${totalBudget.toLocaleString()}`}
            />
          </div>

          <div className="space-y-1">
            <DetailRow
              label="Category"
              value={serviceCategoryId?.name || "Uncategorized"}
            />
            <DetailRow
              label="Event Date"
              value={
                eventDetails?.startDate
                  ? format(new Date(eventDetails.startDate), "MMMM d, yyyy")
                  : "N/A"
              }
            />
            <DetailRow
              label="Guests"
              value={eventDetails?.guestCount?.toString() || "N/A"}
            />
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Attachments
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment._id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span className="truncate pr-3">
                    {attachment.originalName || "Attachment"}
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-3">
          {(status === "active" || status === "pending_approval" || status === "completed") && (
            <Button asChild variant="default">
              <Link href={`/client/requests/compare-requests?requestId=${request._id}`}>
                View & Compare Quotes
              </Link>
            </Button>
          )}
          {status === "draft" && (
            <Button asChild variant="outline">
              <Link href={`/client/custom-request/edit/${request._id}`}>
                Edit Draft
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
