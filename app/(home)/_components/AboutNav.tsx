"use client";

import Logo from "@/components/brand/logo";
import { Search, MapPin, CircleUserIcon } from "lucide-react";
import { Button } from "@base-ui/react";

export default function AboutNav() {
  return (
    <section className="bg-[#FFFFFF]">
      <div className="relative flex flex-wrap justify-between items-center px-4 sm:px-10 md:px-20 py-5 gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 z-10">
          <Logo />
        </div>

        {/* Search + Location */}
        <div className="flex flex-wrap items-center gap-2 justify-center w-full md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:flex-1 md:w-auto">
          {/* Search */}
          <div className="flex items-center gap-2 w-full sm:w-[280px] md:w-[315px] rounded-lg px-3 py-2 bg-white border border-gray-200">
            <Search className="shrink-0" />
            <input
              type="text"
              placeholder="Find a vendor for your event"
              className="w-full outline-none border-none placeholder:text-gray-400"
            />
          </div>

          {/* Location + Button */}
          <div className="flex justify-between border w-full sm:w-[280px] md:w-[315px] rounded-lg border-gray-200 bg-white px-3 py-1">
            <div className="flex items-center gap-2">
              <MapPin />
              <span className="text-[#808080] text-sm">East London</span>
            </div>
            <button className="bg-primary text-[#FFFFFF] py-1 px-8 rounded-lg whitespace-nowrap text-sm">
              Find
            </button>
          </div>
        </div>

        {/* Sign in / Sign up */}
        <div className="flex-shrink-0 w-full sm:w-auto z-10">
          <li>
            <Button className="bg-white/25 p-2 rounded-lg text-[13px] flex items-center justify-center gap-2 w-full sm:w-auto">
              <CircleUserIcon /> Sign in/Sign up
            </Button>
          </li>
        </div>
      </div>
    </section>
  );
}
