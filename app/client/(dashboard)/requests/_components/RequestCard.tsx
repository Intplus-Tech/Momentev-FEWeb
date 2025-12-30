import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { RequestCardData } from "../_data";

type RequestCardProps = {
  request: RequestCardData;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{label}:</span> {value}
    </p>
  );
}

export function RequestCard({ request }: RequestCardProps) {
  const { quotes } = request;
  const hasQuotes = quotes.entries.length > 0;

  return (
    <Card className="border border-border/50">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>Posted: {request.postedDate}</p>
          {request.expiresIn && (
            <p className="font-medium text-foreground">
              Expires in {request.expiresIn}
            </p>
          )}
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {request.title}
            </p>
            <DetailRow label="Location" value={request.location} />
            <DetailRow label="Budget" value={request.budget} />
          </div>

          <div className="space-y-1">
            <DetailRow label="Event Type" value={request.eventType} />
            <DetailRow label="Event Date" value={request.eventDate} />
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Status</p>
            <p className="text-sm text-muted-foreground">
              {request.status.label}
            </p>
            <p className="text-3xl font-semibold text-foreground">
              {request.status.sentCount}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Quote Received ({quotes.received}/{quotes.target})
            </p>

            {hasQuotes ? (
              <div className="space-y-2 text-sm text-muted-foreground ">
                {quotes.entries.map((quote) => (
                  <div
                    key={quote.vendor}
                    className="space-y-0.5 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">
                        {quote.vendor}
                      </span>
                      <span>{quote.amount}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                        {quote.rating.toFixed(1)}
                      </span>
                      <span>• {quote.reviews} reviews</span>
                      {quote.summary && <span>• {quote.summary}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No quotes received yet.
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-3">
          {request.primaryAction.href ? (
            <Button
              asChild
              variant={request.primaryAction.variant ?? "default"}
            >
              <Link href={request.primaryAction.href}>
                {request.primaryAction.label}
              </Link>
            </Button>
          ) : (
            <Button variant={request.primaryAction.variant ?? "default"}>
              {request.primaryAction.label}
            </Button>
          )}
          {request.secondaryActions.map((action) => (
            <Button key={action} variant="link" className="px-0 text-primary">
              {action}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
