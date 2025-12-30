import { Star } from "lucide-react";

import type { Review } from "../data";
import { AvatarFallbackCircle } from "./avatar-fallback-circle";
import { SectionShell } from "./section-shell";

export const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {
  return (
    <SectionShell title="Latest Reviews">
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-2 rounded-xl border px-4 py-4 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <AvatarFallbackCircle name={review.name} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {review.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};
