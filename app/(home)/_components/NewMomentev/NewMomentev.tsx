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

export default function NewMomentev() {
  const vendors = [
    {
      img: "https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "The Glow Loft",
      location: "London, Oxford",
      profession: "Makeup Artist",
      rating: "5.0 [1,142]",
      slug: "the-glow-loft",
    },
    {
      img: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Elite Catering Co.",
      location: "Manchester, Spinningfield",
      profession: "Caterers",
      rating: "5.0 [856]",
      slug: "elite-catering-co",
    },
    {
      img: "https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Harmony Weddings",
      location: "Birmingham, Broad Street",
      profession: "Wedding Planner",
      rating: "5.0 [1,025]",
      slug: "harmony-weddings",
    },
    {
      img: "https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "City Sound & Lights",
      location: "Liverpool, Baltic Triangle",
      profession: "Sound & Lighting",
      rating: "5.0 [732]",
      slug: "city-sound-lights",
    },
    {
      img: "https://images.pexels.com/photos/2306203/pexels-photo-2306203.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Creative Decor Studio",
      location: "Leeds, Headingley",
      profession: "Event Decorator",
      rating: "4.9 [615]",
      slug: "creative-decor-studio",
    },
    {
      img: "https://images.pexels.com/photos/3585089/pexels-photo-3585089.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Perfect Moments DJ",
      location: "Newcastle, Quayside",
      profession: "DJ Services",
      rating: "5.0 [892]",
      slug: "perfect-moments-dj",
    },
    {
      img: "https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Artisan Bartenders",
      location: "Brighton, North Laine",
      profession: "Bar Services",
      rating: "4.8 [543]",
      slug: "artisan-bartenders",
    },
    {
      img: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Signature Transport",
      location: "Oxford, City Centre",
      profession: "Transport Services",
      rating: "5.0 [721]",
      slug: "signature-transport",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto px-6 md:px-0 py-10 flex flex-col items-center space-y-6 relative">
        {/* Title */}
        <div className="w-full flex items-center justify-between max-w-6xl md:px-10 xl:px-5">
          <p className="font-semibold text-lg text-foreground">
            New To Momentev
          </p>
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
