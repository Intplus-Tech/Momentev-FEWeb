"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function FeaturedVendors() {
  const vendors = [
    {
      img: "/Makeup-img.png",
      name: "The Glow Loft",
      location: "London, Oxford",
      profession: "Makeup Artist",
      rating: "5.0 [1,142]",
    },
    {
      img: "/Caterer-img.png",
      name: "Elite Catering Co.",
      location: "Manchester, spinningfield",
      profession: "Caterers",
      rating: "5.0 [856]",
    },
    {
      img: "/Planner-img.png",
      name: "Harmony Weddings",
      location: "Birmingham, Broad Street",
      profession: "Caterer",
      rating: "5.0 [1,025]",
    },
    {
      img: "/sound-img.png",
      name: "City Sound & Lights",
      location: "Liverpool, Baltic Triangle",
      profession: "City Sound & Lighting",
      rating: "5.0 [732]",
    },
  ];

  const duplicated = [...vendors, ...vendors];

  const CARD_WIDTH = 278; // card + gap
  const TOTAL_SET_WIDTH = vendors.length * CARD_WIDTH;

  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        let next = direction === "right" ? prev - 1 : prev + 1;

        // Seamless looping logic
        if (next <= -TOTAL_SET_WIDTH) {
          next += TOTAL_SET_WIDTH;
        }
        if (next >= 0) {
          next -= TOTAL_SET_WIDTH;
        }

        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [direction, TOTAL_SET_WIDTH]);

  return (
    <section className="bg-white" ref={containerRef}>
      <div className="max-w-8xl mx-auto px-6 md:px-0 py-10 flex flex-col items-center space-y-6">

        {/* Title + arrows */}
        <div className="w-full flex items-center justify-between px-10">
          <p className="font-semibold text-lg">Featured Vendors</p>

          <div className="flex items-center gap-2">
            <ChevronLeft
              onClick={() => setDirection("left")}
              className="cursor-pointer border-2 rounded-2xl"
            />
            <ChevronRight
              onClick={() => setDirection("right")}
              className="cursor-pointer border-2 rounded-2xl"
            />
          </div>
        </div>

        {/* Viewport */}
        <div className="w-full overflow-hidden px-6 md:px-12">
          <div
            className="flex gap-5"
            style={{
              transform: `translateX(${offset}px)`,
              willChange: "transform",
            }}
          >
            {duplicated.map((vendor, index) => (
              <div key={index} className="relative w-58 space-y-3 shrink-0">
                <Image
                  src={vendor.img}
                  alt={vendor.name}
                  width={258}
                  height={263}
                  className="max-w-full h-auto rounded-2xl"
                />

                <div className="absolute bottom-25 right-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                  <Star className="w-4 h-4 text-black" />
                  <span className="text-sm font-medium text-black">
                    {vendor.rating}
                  </span>
                </div>

                <p className="font-semibold text-base text-foreground">
                  {vendor.name}
                </p>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="" />
                  <p>{vendor.location}</p>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BriefcaseBusiness className="" />
                  <p>{vendor.profession}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
