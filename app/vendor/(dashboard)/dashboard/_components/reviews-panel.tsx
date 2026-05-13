import type { VendorReview } from "@/lib/actions/reviews";

import { format } from "date-fns";
import { Star } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function ReviewsPanel({ reviews }: { reviews: VendorReview[] }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>What clients are saying</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/vendor/settings?tab=reviews">
          View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.length === 0 ? (
          <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
            No reviews yet
          </p>
        ) : (
          reviews.map((review) => {
            const author = `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim() || "Client";
            const initials = `${review.reviewer.firstName?.[0] || ""}${review.reviewer.lastName?.[0] || ""}`.toUpperCase() || "?";

            return (
              <div
                key={review._id}
                className="flex h-full flex-col rounded-2xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" className="h-9 w-9">
                      <AvatarImage src={review.reviewer.avatar} alt={author} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{author}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
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
                  {review.comment}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
