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
            <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground uppercase">
              {status.replace("_", " ")}
            </div>
          </div>
          <RequestActions requestId={_id} />
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

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href={`/client/requests/${request._id}`}>View Details</Link>
          </Button>
          {/* Placeholder actions */}
          {/*
          <Button variant="link" className="px-0 text-primary">
            Edit Request
          </Button>
          */}
        </div>
      </CardContent>
    </Card>
  );
}
