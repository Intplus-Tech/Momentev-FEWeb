import { ExternalLink, Star, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { ClientReview } from "../data";
import { SectionShell } from "./section-shell";

export const ReviewsSection = ({ reviews }: { reviews: ClientReview[] }) => {
  return (
    <SectionShell title={`${reviews.length} Reviews`}>
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Keep track of the feedback you have shared with your vendors.
        </p>
        <button className="text-primary hover:underline">
          Write New Review
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className="space-y-3 rounded-xl border border-border/50 bg-white px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="hidden md:flex h-6 w-6 mt-2 items-center justify-center rounded-full bg-primary/10 text-xs">
                {index + 1}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {review.avatar ? (
                      <AvatarImage
                        src={review.avatar}
                        alt={review.vendorName}
                      />
                    ) : (
                      <AvatarFallback>
                        {review.vendorName
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {review.vendorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star key={idx} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground mt-4">
                  {review.text}
                </p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <button type="button" aria-label="Open review">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Delete review">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};
