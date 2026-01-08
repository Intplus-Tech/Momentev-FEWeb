"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="bg-[#F0F0F0] pb-20 flex flex-col xl:h-screen">
      <div className="container mx-auto pt-40 px-4 sm:px-10 md:px-35 lg:px-35 space-y-20 flex flex-col">
        <div className="flex items-center gap-2 pb-5 justify-center sm:justify-start text-sm sm:text-base">
          <button>
            <Home className="text-primary" />
          </button>
          <p>/</p>
          <p className="font-semibold">About us</p>
        </div>

        <div className="space-y-5 text-center sm:text-left w-full max-w-full lg:max-w-none">
          <div className="max-w-full">
            <p className="text-foreground md:leading-relaxed text-[30px] md:text-4xl lg:text-5xl">
              Your Moments, Made <br /> Effortlessly Simple
            </p>
          </div>

          <div className="max-w-full sm:max-w-180 h-auto sm:h-22.5">
            <p className="text-[16px] sm:text-[20px] text-muted-foreground">
              Discover trusted event service providers around you — from bakers
              to MCs and decorators — all in one seamless platform designed to
              take the stress out of planning your perfect day.
            </p>
          </div>

          <Button size={"lg"} className="w-60">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
