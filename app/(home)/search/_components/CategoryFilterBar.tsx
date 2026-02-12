"use client";

import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCategory } from "@/types/service";

interface CategoryFilterBarProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  const { data: categoriesData, isLoading } = useServiceCategories();

  // Access the nested data array from the paginated response
  const categories = categoriesData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm sticky top-14 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category: ServiceCategory) => {
            const isActive = selectedCategory === category._id;
            return (
              <button
                key={category._id}
                onClick={() => onCategoryChange(category._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                }`}
              >
                {/* 
                  Assuming category has an icon/image field. 
                  If it's an SVG URL or regular image URL, proper handling is needed.
                  Using a placeholder approach if no icon is available immediately or simple generic logic.
                */}
                {/* Icon ignored as it is not a URL */}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
