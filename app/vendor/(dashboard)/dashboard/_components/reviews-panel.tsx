import type { VendorReview } from "@/lib/actions/reviews";

import { format } from "date-fns";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReviewsPanel({ reviews }: { reviews: VendorReview[] }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>What clients are saying</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.length === 0 ? (
          <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
            No reviews yet
          </p>
        ) : (
          reviews.map((review) => {
            const author =
              typeof review.customerId === "object"
                ? `${review.customerId.firstName} ${review.customerId.lastName}`.trim()
                : "Client";

            return (
              <div
                key={review._id}
                className="flex h-full flex-col rounded-2xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{author}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        className="size-3"
                        fill={star < review.rating ? "currentColor" : "none"}
                        strokeWidth={star < review.rating ? 0 : 1.5}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {review.review}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
