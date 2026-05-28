import { ReviewsSection as SharedReviewsSection } from "@/app/(home)/search/_vendor-components/ReviewsSection";
import type { ReviewUI, ReviewStats } from "@/types/review";

interface VendorReviewsProps {
  vendorId: string;
  reviews: ReviewUI[];
  stats: ReviewStats;
}

export const ReviewsSection = ({ vendorId, reviews, stats }: VendorReviewsProps) => {
  return (
    <div className="pt-2">
      <SharedReviewsSection
        vendorId={vendorId}
        reviews={reviews}
        stats={stats}
        hideTitle
      />
    </div>
  );
};
