import type { Review } from "../data";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReviewsPanel({ reviews }: { reviews: Review[] }) {
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
        {reviews.map((review, index) => (
          <div
            key={`${review.author}-${index}`}
            className="flex h-full flex-col rounded-2xl border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{review.author}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    className="size-3 text-primary"
                    fill="currentColor"
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {review.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
