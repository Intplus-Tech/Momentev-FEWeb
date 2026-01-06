"use client";

import { useState } from "react";
import Logo from "@/components/brand/logo";
import { Search, MapPin, CircleUserIcon, X } from "lucide-react";
import { Button } from "@base-ui/react";

export default function AboutNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-[#FFFFFF]">
      <div className="relative flex justify-between items-center px-4 sm:px-10 md:px-20 py-5 md:flex-wrap gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 z-20">
          <Logo />
        </div>

        {/* Hamburger - mobile only */}
        <Button
          className="md:hidden flex items-center z-30 cursor-pointer bg-transparent p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
          </div>}
        </Button>

        


        {/* Desktop content — keep original UI, hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-4">
          {/* Search + Location */}
          <div className="flex flex-wrap items-center gap-2 justify-center w-full md:flex-1 md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-[280px] md:w-[315px] rounded-lg px-3 py-2 bg-white border border-gray-200">
              <Search className="shrink-0" />
              <input
                type="text"
                placeholder="Find a vendor for your event"
                className="w-full outline-none border-none placeholder:text-gray-400"
              />
            </div>
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
            <Button className="bg-white/25 p-2 rounded-lg text-[13px] flex items-center justify-center gap-2 w-full sm:w-auto">
              <CircleUserIcon /> Sign in/Sign up
            </Button>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
            } flex flex-col p-6 space-y-6`}
        >
          {/* Search */}
          <div className="flex items-center gap-2 w-full rounded-lg px-3 py-2 bg-white border border-gray-200">
            <Search className="shrink-0" />
            <input
              type="text"
              placeholder="Find a vendor for your event"
              className="w-full outline-none border-none placeholder:text-gray-400"
            />
          </div>

          {/* Location + Button */}
          <div className="flex justify-between border w-full rounded-lg border-gray-200 bg-white px-3 py-1">
            <div className="flex items-center gap-2">
              <MapPin />
              <span className="text-[#808080] text-sm">East London</span>
            </div>
            <button className="bg-primary text-[#FFFFFF] py-1 px-8 rounded-lg whitespace-nowrap text-sm">
              Find
            </button>
          </div>

          {/* Sign in / Sign up */}
          <Button className="bg-white/25 p-2 rounded-lg text-[13px] flex items-center justify-center gap-2 w-full">
            <CircleUserIcon /> Sign in/Sign up
          </Button>
        </div>

      </div>
    </section>
  );
}
