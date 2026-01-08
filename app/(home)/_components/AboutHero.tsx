"use client";

import { Home } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="bg-gray-200 flex flex-col min-h-screen">
      <div className="pt-20 px-4 sm:px-10 md:px-[140px] lg:px-35 space-y-20 flex flex-col">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-5 justify-center sm:justify-start text-sm sm:text-base">
          <button>
            <Home className="text-primary" />
          </button>
          <p>/</p>
          <button className="text-[#142141]">Search</button>
          <p>/</p>
          <button>About us</button>
        </div>

        {/* Headline and Description */}
        <div className="space-y-5 text-center sm:text-left w-full max-w-full lg:max-w-none">
          {/* Headline */}
          <div className="max-w-full sm:max-w-[378px]">
            <p className="text-foreground text-[24px] sm:text-[30px] font-semibold">
              Your Moments, Made Effortlessly Simple
            </p>
          </div>

          {/* Description */}
          <div className="max-w-full sm:max-w-[720px] h-auto sm:h-[90px]">
            <p className="text-[16px] sm:text-[20px] text-muted-foreground">
              Discover trusted event service providers around you — from bakers to MCs and decorators — all in one seamless platform designed to take the stress out of planning your perfect day.
            </p>
          </div>

          {/* Button */}
          <div>
            <button className="bg-primary w-full sm:w-[360px] px-6 sm:px-30 rounded-lg text-white py-2 text-sm sm:text-base">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
