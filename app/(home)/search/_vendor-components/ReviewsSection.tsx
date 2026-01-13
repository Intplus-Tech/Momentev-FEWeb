"use client";

import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Review {
  id: string;
  author: string;
  initials: string;
  date: string;
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

interface ReviewsSectionProps {
  reviews: Review[];
  stats: ReviewStats;
}

export function ReviewsSection({ reviews, stats }: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState("newest");

  const maxCount = Math.max(...stats.distribution.map((d) => d.count));

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-6">Reviews</h2>

      {/* Stats Overview */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 bg-white rounded-2xl p-6">
        {/* Rating */}
        <div className="flex flex-col items-start">
          <div className="text-4xl font-bold text-foreground">
            {stats.average}
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(stats.average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ({stats.total.toLocaleString()} Reviews)
          </p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-2">
          {stats.distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-12">
                {item.stars} stars
              </span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.stars >= 4 ? "bg-primary" : "bg-yellow-400"
                  }`}
                  style={{
                    width: `${
                      maxCount > 0 ? (item.count / maxCount) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sort and Write Review */}
      <div className="flex items-center justify-between mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="gap-2 text-sm font-normal h-9"
            >
              Sort by {sortBy === "newest" ? "newest" : "highest rating"} review
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("highest")}>
              Highest rating
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="h-9">Write a Review</Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 bg-white rounded-2xl p-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-t pt-6">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-3">{review.date}</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {review.initials}
              </div>
              <span className="text-sm font-medium">{review.author}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {review.category}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
