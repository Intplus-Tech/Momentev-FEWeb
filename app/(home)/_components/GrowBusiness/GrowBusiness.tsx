import { Button } from "@base-ui/react";
import { Minus } from "lucide-react";
import Image from "next/image";

export default function GrowBusiness() {
  return (
    <section className="container max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 ">
        {/* Image section */}
        <div className="relative flex flex-col items-center mt-20">
          {/* Book image */}
          <Image
            src="/GrowBusiness-img.png"
            alt="Book image"
            width={300}
            height={200}
            className="bg-[#F5F7FF] relative z-10 "
          />

          {/* Rectangle image UNDER, pushed up halfway */}
          <Image
            src="/rectangle-img.png"
            alt="rectangle image"
            width={600}
            height={250}
            className="bg-[#F5F7FF] -mt-[125px] mr-10"
          />
        </div>

        {/* Text section */}

        <div className="w-88 h-69 space-y-5">
          <div className="flex items-center gap-2">
            <Minus />
            <p className="font-medium text-sm">How we work</p>
          </div>

          <h2
            className="w-78 text-[#4F4F4F
] font-semibold text-2xl"
          >
            Grow Your Business with Momentev
          </h2>

          <p className="text-4 font-normal text-[#4F4F4F]">
            Vendors get a simple way to showcase their services, attract new
            clients, and manage bookings — all in one platform built for
            convenience.
          </p>

          <Button className="bg-primary p-3 text-white w-47 rounded-lg">
            List your business
          </Button>
        </div>
      </div>
    </section>
  );
}
