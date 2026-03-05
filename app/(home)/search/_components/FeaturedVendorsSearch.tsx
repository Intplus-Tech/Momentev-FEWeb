"use client";

import Link from "next/link";
import { MapPin, Star, Sparkles, BriefcaseBusiness } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { FeaturedVendorItem } from "@/lib/actions/featured-vendors";

type FeaturedVendorsSearchProps = {
  vendors: FeaturedVendorItem[];
};

export function FeaturedVendorsSearch({ vendors }: FeaturedVendorsSearchProps) {
  if (vendors.length === 0) return null;

  return (
    <div className="mb-8 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Featured Vendors</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {vendors.map((vendor) => (
            <CarouselItem key={vendor.id} className="pl-3 md:pl-4 basis-full min-[400px]:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Link href={`/search/${vendor.slug}`} className="block h-full group">
                <div className="flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all h-full dark:border-border/50 animate-in fade-in zoom-in-95 duration-300">
                  {/* Image */}
                  <div className="relative w-full aspect-4/3 shrink-0 bg-muted">
                    <Image
                      src={vendor.image || "/images/placeholder.jpg"}
                      alt={vendor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm shadow-sm">
                      Featured
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-3">
                    <h3 className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {vendor.name}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <p className="line-clamp-1 text-xs">{vendor.location}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BriefcaseBusiness className="w-3.5 h-3.5 shrink-0" />
                        <p className="line-clamp-1 text-xs">
                          {vendor.profession}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span className="font-medium text-foreground">{vendor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">({vendor.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation buttons - positioned at top right */}
        <div className="hidden sm:flex items-center gap-2 absolute -top-10 right-0">
          <CarouselPrevious className="static translate-y-0 translate-x-0 w-8! h-8!" />
          <CarouselNext className="static translate-y-0 translate-x-0 w-8! h-8!" />
        </div>
      </Carousel>
    </div>
  );
}
