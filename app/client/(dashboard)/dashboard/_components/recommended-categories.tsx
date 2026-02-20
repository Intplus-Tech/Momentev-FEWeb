import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

export interface RecommendedVendor {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  categoryName: string;
  rate: number;
  address: string;
}

interface RecommendedVendorsProps {
  vendors: RecommendedVendor[];
  isLoading?: boolean;
  hasBookings?: boolean;
}

export function RecommendedVendors({
  vendors,
  isLoading,
  hasBookings = false,
}: RecommendedVendorsProps) {
  if (isLoading) {
    return (
      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between px-0">
          <div>
            <CardTitle>Recommended for you</CardTitle>
            <CardDescription>Loading recommendations...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl">
                <div className="overflow-hidden rounded-xl">
                  <div className="h-40 w-full animate-pulse bg-muted-foreground/20" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vendors.length === 0) {
    return (
      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between px-0">
          <div>
            <CardTitle>Recommended for you</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/40 px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Star className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              {hasBookings ? "No similar vendors found" : "Discover top vendors"}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              {hasBookings
                ? "We couldn't find any other vendors in this category right now. Check back later or explore other categories."
                : "Book a vendor to get personalised recommendations tailored to your event needs."}
            </p>
            <Button asChild>
              <Link href="/search">Browse all vendors</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <div>
          <CardTitle>Recommended for you</CardTitle>
          <CardDescription>
            Vendors similar to your recent bookings.
          </CardDescription>
        </div>
        <Button variant="link" asChild>
          <Link href="/search">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor._id}
              href={`/search/${vendor.slug}`}
              className="group rounded-2xl transition-opacity hover:opacity-90"
            >
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={vendor.coverImage || "/placeholder-vendor.jpg"}
                  alt={vendor.name}
                  width={640}
                  height={160}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {vendor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vendor.categoryName}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{vendor.rate.toFixed(1)}</span>
                  {vendor.address && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="truncate">{vendor.address}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
