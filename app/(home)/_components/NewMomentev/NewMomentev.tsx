"use client";

import { useState } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function NewMomentev() {
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
      profession: "caterers",
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const CARD_WIDTH = 258; // image width
  const GAP = 20; // gap-5
  const MOVE_X = CARD_WIDTH + GAP;

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < vendors.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <section className="bg-white w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-0 py-10 flex flex-col items-center space-y-6">

        {/* Title + arrows */}
        <div className="w-full max-w-5xl md:max-w-none flex items-center justify-between">
          <p className="font-semibold text-lg text-foreground">New To Momentev</p>

          <div className="flex items-center gap-2 px-10">
            <ChevronLeft
              onClick={handlePrev}
              className="cursor-pointer border-2 rounded-2xl"
            />
            <ChevronRight
              onClick={handleNext}
              className="cursor-pointer border-2 rounded-2xl"
            />
          </div>
        </div>

        {/* Cards container — UI unchanged */}
        {/* Cards container — UI unchanged */}
        <div className="overflow-hidden w-full">
          <div
            className="flex flex-nowrap md:flex-wrap justify-center gap-5 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * MOVE_X}px)`,
            }}
          >
            {vendors.map((vendor, index) => (
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
                  <MapPin className="w-4 h-4" />
                  <p>{vendor.location}</p>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BriefcaseBusiness className="w-4 h-4" />
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
