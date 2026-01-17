"use client";

import { useState } from "react";
import HeroMiddle from "./HeroMiddle";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Background images for each service category
const serviceBackgrounds = [
  "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=1920", // Makeup Artists
  "https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=1920", // Caterers
  "https://images.pexels.com/photos/3379942/pexels-photo-3379942.jpeg?auto=compress&cs=tinysrgb&w=1920", // Photographers
  "https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=1920", // DJs
  "https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=1920", // Decorators
];

const Hero = () => {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  return (
    <section className="relative min-h-screen md:min-h-fit xl:min-h-screen w-full font-inter flex flex-col overflow-hidden">
      {/* Dynamic Background Images with Crossfade */}
      {serviceBackgrounds.map((bg, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentServiceIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={bg}
            alt=""
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Hero Content */}
      <div className="flex-1 flex items-center relative z-10">
        <HeroMiddle onServiceChange={setCurrentServiceIndex} />
      </div>
    </section>
  );
};

export default Hero;
