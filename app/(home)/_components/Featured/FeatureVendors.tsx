"use client";

import Link from "next/link";
import { MapPin, BriefcaseBusiness, Star } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function FeaturedVendors() {
  const vendors = [
    {
      img: "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "The Glow Loft",
      location: "London, Oxford",
      profession: "Makeup Artist",
      rating: "5.0 [1,142]",
      slug: "the-glow-loft",
    },
    {
      img: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Elite Catering Co.",
      location: "Manchester, Spinningfield",
      profession: "Caterers",
      rating: "5.0 [856]",
      slug: "elite-catering-co",
    },
    {
      img: "https://images.pexels.com/photos/2788792/pexels-photo-2788792.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Harmony Weddings",
      location: "Birmingham, Broad Street",
      profession: "Wedding Planner",
      rating: "5.0 [1,025]",
      slug: "harmony-weddings",
    },
    {
      img: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "City Sound & Lights",
      location: "Liverpool, Baltic Triangle",
      profession: "Sound & Lighting",
      rating: "5.0 [732]",
      slug: "city-sound-lights",
    },
    {
      img: "https://images.pexels.com/photos/1549280/pexels-photo-1549280.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Blooming Designs",
      location: "Edinburgh, Old Town",
      profession: "Florist",
      rating: "4.9 [923]",
      slug: "blooming-designs",
    },
    {
      img: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lens & Light Studios",
      location: "Bristol, Harbourside",
      profession: "Photographer",
      rating: "5.0 [1,456]",
      slug: "lens-light-studios",
    },
    {
      img: "https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Sweet Celebrations",
      location: "Leeds, City Centre",
      profession: "Baker",
      rating: "4.9 [687]",
      slug: "sweet-celebrations",
    },
    {
      img: "https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Grand Venue Hire",
      location: "Cardiff, Bay Area",
      profession: "Venue Provider",
      rating: "5.0 [1,234]",
      slug: "grand-venue-hire",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto px-6 md:px-0 py-10 flex flex-col items-center space-y-6 relative">
        {/* Title */}
        <div className="w-full flex items-center justify-between max-w-6xl md:px-10 xl:px-5">
          <p className="font-semibold text-lg">Featured Vendors</p>
        </div>

        {/* Carousel */}
        <div className="w-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            className="w-full md:px-10 xl:px-30"
          >
            <CarouselContent className="-ml-5">
              {vendors.map((vendor, index) => (
                <CarouselItem key={index} className="pl-5 basis-auto">
                  <Link
                    href={`/search/${vendor.slug}`}
                    className="block w-50 xl:w-64.5 shrink-0 group"
                  >
                    <div className="relative w-50 xl:w-64.5 h-50 xl:h-64.5 rounded-2xl overflow-hidden mb-3">
                      <Image
                        src={vendor.img}
                        alt={vendor.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      <div className="absolute bottom-3 right-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium text-black">
                          {vendor.rating}
                        </span>
                      </div>
                    </div>

                    <p className="font-semibold text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                      {vendor.name}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      <p>{vendor.location}</p>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BriefcaseBusiness className="w-4 h-4" />
                      <p>{vendor.profession}</p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center gap-4 absolute -top-10 right-10 xl:right-44">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
