"use client";

import { useState } from "react";
import Image from "next/image";

export default function PeopleFeel() {
  const vendors = [
    {
      img: "/Daniel-img.png",
      name: "Daniel White",
      location: "Liverpool",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
    },
    {
      img: "/Amalia-img.png",
      name: "Amelia Samantha",
      location: "Birmingham",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
    },
    {
      img: "/Alex-img.png",
      name: "Alex Carter",
      location: "London",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
    },
    {
      img: "/Alice-img.png",
      name: "Alicia Roberts",
      location: "Manchester",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = 258;
  const GAP = 20; // gap-5
  const OFFSET = CARD_WIDTH + GAP;

  return (
    <section className="bg-[#b1afaf] w-full">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex flex-col space-y-6">

        {/* Title */}
        <div className="flex items-center justify-center">
          <p className="font-semibold text-lg">What people feel with Momentev</p>
        </div>

        {/* Cards container — UI unchanged */}
        <div className="overflow-hidden">
          <div
            className="flex flex-nowrap justify-center gap-5 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * OFFSET}px)`,
            }}
          >
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="relative w-[258px] space-y-3 flex flex-col flex-shrink-0"
              >
                <Image
                  src={vendor.img}
                  alt={vendor.name}
                  width={258}
                  height={263}
                  className="w-full h-auto rounded-2xl"
                />

                <p className="font-semibold text-base text-[#142141]">
                  {vendor.name}
                </p>

                <div className="space-y-3 ">
                  <p className="text-sm text-gray-700">{vendor.location}</p>

                  <div className="text-[11px] text-gray-700 max-w-full leading-tight overflow-hidden">
                    <p className="line-clamp-3">{vendor.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel indicators — functional */}
        <div className="flex justify-center items-center gap-3 pt-6">
          {vendors.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-4 w-4 rounded-full border border-primary transition
                ${index === activeIndex ? "bg-primary" : "bg-transparent"}
              `}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
