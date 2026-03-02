import { ReviewsSection as SharedReviewsSection } from "@/app/(home)/search/_vendor-components/ReviewsSection";

interface Review {
  id: string;
  author: string;
  initials: string;
  date: string;
  rawDate: string;
  rating: number;
  category: string;
  content: string;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    stars: number;
    count: number;
  }[];
}

interface VendorReviewsProps {
  vendorId: string;
  reviews: Review[];
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
