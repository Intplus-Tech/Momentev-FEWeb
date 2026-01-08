import { Button } from "@/components/ui/button";
import { Bath, Camera, Gift, Martini, Search, MapPin } from "lucide-react";
import Image from "next/image";

export default function HeroMiddle() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-5xl w-full mx-auto text-center space-y-6 md:space-y-8">
        {/* Logo / Image */}
        <div className="flex justify-center">
          <Image
            src="/image-c.png"
            alt="Book Trusted"
            width={730}
            height={64}
            className="max-w-full w-full sm:w-auto h-auto px-4 sm:px-0"
            priority
          />
        </div>

        {/* Subtitle */}
        <p className="text-white text-sm sm:text-base lg:text-lg px-4 max-w-2xl mx-auto">
          Discover, compare, and secure caterers, photographers, and more—all in
          one place.
        </p>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-3 flex-1 px-4 py-4 bg-white border-b sm:border-b-0 sm:border-r border-gray-200">
            <Search className="shrink-0 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Find a vendor for your event"
              className="w-full outline-none border-none placeholder:text-gray-400 text-sm md:text-base"
            />
          </div>

          {/* Location + button */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 w-full sm:w-auto bg-white px-4 py-4">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-5 h-5 shrink-0 text-gray-600" />
              <span className="text-sm md:text-base whitespace-nowrap">
                East London
              </span>
            </div>
            <Button className="min-w-[80px] shrink-0">Find</Button>
          </div>
        </div>

        {/* Browse text */}
        <p className="text-white text-sm sm:text-base">
          or Browse Featured Category
        </p>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
          <Button className="bg-white/25 hover:bg-white/35 backdrop-blur-sm py-2 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm text-white flex items-center gap-2 transition-colors">
            <Gift className="w-4 h-4" />
            <span className="hidden xs:inline">Birthday party</span>
            <span className="xs:hidden">Birthday</span>
          </Button>
          <Button className="bg-white/25 hover:bg-white/35 backdrop-blur-sm py-2 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm text-white flex items-center gap-2 transition-colors">
            <Camera className="w-4 h-4" /> Photography
          </Button>
          <Button className="bg-white/25 hover:bg-white/35 backdrop-blur-sm py-2 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm text-white flex items-center gap-2 transition-colors">
            <Martini className="w-4 h-4" /> Corporate
          </Button>
          <Button className="bg-white/25 hover:bg-white/35 backdrop-blur-sm py-2 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm text-white flex items-center gap-2 transition-colors">
            <Bath className="w-4 h-4" />
            <span className="hidden xs:inline">Baby shower</span>
            <span className="xs:hidden">Baby</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
