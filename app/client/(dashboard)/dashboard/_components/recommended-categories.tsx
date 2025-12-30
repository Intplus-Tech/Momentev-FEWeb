import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type RecommendedCategory = {
  title: string;
  image: string;
};

interface RecommendedCategoriesProps {
  categories: RecommendedCategory[];
}

export function RecommendedCategories({
  categories,
}: RecommendedCategoriesProps) {
  return (
    <Card className="p-0">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <div>
          <CardTitle>Recommended for you</CardTitle>
          <CardDescription>
            Browse curated categories for your next booking.
          </CardDescription>
        </div>
        <Button variant="link" asChild>
          <Link href="#">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <div key={category.title} className="rounded-2xl">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {category.title}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
