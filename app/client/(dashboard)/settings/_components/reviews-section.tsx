import {
  ExternalLink,
  Star,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useClientReviews } from "@/hooks/api/use-client-reviews";

import { SectionShell } from "./section-shell";

export const ReviewsSection = () => {
  const { data: user } = useUserProfile();
  const { data: reviewsData, isLoading } = useClientReviews(user?._id);

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <SectionShell title="Reviews">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={`${reviewsData?.total || 0} Reviews`}>
      <div className="space-y-4 p-4 xl:min-h-[45vh] flex items-center justify-center">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No reviews yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              You haven't shared any feedback with your vendors yet. Your
              reviews help others make better choices.
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review._id}
              className="space-y-3 rounded-xl border border-border/50 bg-white px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="hidden md:flex h-6 w-6 mt-2 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {review.vendorId.avatar?.url ? (
                        <AvatarImage
                          src={review.vendorId.avatar.url}
                          alt={`${review.vendorId.firstName} ${review.vendorId.lastName}`}
                        />
                      ) : (
                        <AvatarFallback>
                          {review.vendorId.firstName?.[0]}
                          {review.vendorId.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.vendorId.firstName} {review.vendorId.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), "MMMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${idx < review.rating ? "fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground mt-4">
                    {review.review}
                  </p>
                </div>

                {/* <div className="flex items-center gap-2 text-muted-foreground">
                  <button type="button" aria-label="Open review">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Delete review">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div> */}
              </div>
            </div>
          ))
        )}
      </div>
    </SectionShell>
  );
};
