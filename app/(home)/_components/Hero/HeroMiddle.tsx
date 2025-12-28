import { Bath, Camera, Gift, Martini, Search, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@base-ui/react";

export default function HeroMiddle() {
  return (
    <section className="flex flex-col items-center justify-center px-6 md:px-0">
      <div className="max-w-7xl w-full mx-auto text-center space-y-5 pt-10  md:translate-y-8">

        {/* Logo / Image */}
        <div className="flex justify-center">
          <Image
            src="/image-c.png"
            alt="Book Trusted"
            width={730}
            height={64}
            className="max-w-full h-auto"
          />
        </div>

        {/* Subtitle */}
        <p className="text-white">
          Discover, compare, and secure caterers, photographers, and more—all in one place.
        </p>

        {/* Search bar */}
        <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto  overflow-hidden">

          {/* Search input */}
          <div className="flex items-center gap-2 w-xl px-3 py-5 bg-white border border-gray-200">
            <Search className="shrink-0" />
            <input
              type="text"
              placeholder="Find a vendor for your event"
              className="w-full outline-none border-none placeholder:text-gray-400"
            />
          </div>

          {/* Location + button */}
          <div className="flex items-center justify-between gap-4 w-full md:w-auto bg-white px-4 py-3">
            <div className="flex  items-center gap-2">
              <MapPin />
              <span className="">East London</span>
            </div>
            <button className="bg-primary text-white py-2 px-8 rounded-lg whitespace-nowrap">
              Find
            </button>
          </div>

        </div>

        {/* Browse text */}
        <p className="text-white">or Browse Featured Category</p>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="bg-white/25 p-2 rounded-2xl text-[13px] text-white flex items-center gap-2">
            <Gift /> Birthday party
          </Button>
          <Button className="bg-white/25 p-2 rounded-2xl text-[13px] text-white flex items-center gap-2">
            <Camera /> Photography
          </Button>
          <Button className="bg-white/25 p-2 rounded-2xl text-[13px] text-white flex items-center gap-2">
            <Martini /> Corporate
          </Button>
          <Button className="bg-white/25 p-2 rounded-2xl text-[13px] text-white flex items-center gap-2">
            <Bath /> Baby shower
          </Button>
        </div>

      </div>
    </section>
  );
}
