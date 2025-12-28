import { Button } from "@base-ui/react";
import { Minus } from "lucide-react";
import Image from "next/image";

export default function BookedServices() {
  return (
    <section className="bg-white">
      <div className="flex flex-col md:flex-row gap-15 items-center justify-center max-w-8xl mx-auto mt-10 px-6">

        {/* Text section */}
        <div className="w-88 h-69 space-y-5">
          <div className="flex items-center gap-2">
            <Minus />
            <p className="font-medium text-sm">How we work</p>
          </div>

          <h2 className=" text-[#4F4F4F] font-semibold text-2xl">Book Services Instantly</h2>

          <p className="text-4 font-normal text-[#4F4F4F]">
            Find trusted vendors near you and book them in real time. From photographers to caterers, everything you need for your event or lifestyle is just a click away.
          </p>

          <Button className="bg-primary p-3 text-white w-47 rounded-lg">
            Find Vendors
          </Button>
        </div>

        {/* Image section */}
        <div className="relative flex flex-col items-center mt-20">
          {/* Book image */}
          <Image
            src="/Book-img.png"
            alt="Book image"
            width={300}
            height={200}
            className="bg-[#F5F7FF] relative z-10"
          />

          {/* Rectangle image UNDER, pushed up halfway */}
          <Image
            src="/rectangle-img.png"
            alt="rectangle image"
            width={600}
            height={250}
            className="bg-[#F5F7FF] -mt-[125px]"
          />
        </div>

      </div>
    </section>
  );
}
