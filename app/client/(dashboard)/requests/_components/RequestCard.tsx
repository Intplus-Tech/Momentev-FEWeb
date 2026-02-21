import Link from "next/link";
import { format } from "date-fns";

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

  const totalBudget = budgetAllocations.reduce(
    (sum, item) => sum + (item.budgetedAmount || 0),
    0,
  );

  return (
    <Card className="border border-border/50">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <p>
              Posted:{" "}
              {createdAt ? format(new Date(createdAt), "MMMM d, yyyy") : "N/A"}
            </p>
            <StatusBadge status={status} />
            <p>Request ID: {_id}</p>
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

        {/* <Separator />

        <div className="flex flex-wrap gap-3">
          {status === "draft" && (
            <Button asChild variant="outline">
              <Link href={`/client/custom-request/edit/${request._id}`}>
                Edit Draft
              </Link>
            </Button>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}
