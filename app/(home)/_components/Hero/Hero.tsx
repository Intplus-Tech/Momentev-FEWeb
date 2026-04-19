"use client";

import HeroMiddle from "./HeroMiddle";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative min-h-screen md:min-h-fit xl:min-h-screen w-full font-inter flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/assets/bg-images/hero-bg.jpeg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/52" />
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Hero Content */}
      <div className="flex-1 flex items-center relative z-10">
        <HeroMiddle />
      </div>
    </section>
  );
};

export default Hero;
