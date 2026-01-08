import { Button } from "@base-ui/react";
import { Minus } from "lucide-react";
import Image from "next/image";

export default function GrowBusiness() {
  return (
    <section className="container max-w-5xl mx-auto px-4 md:px-10 xl:px-0 mb-40 relative">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 ">
        {/* Image section */}
        
          {/* Book image */}
          <Image
            src="/GrowBusiness-img.png"
            alt="Book image"
            width={400}
            height={400}
            className="bg-[#F5F7FF] relative z-10 hidden md:block"
          />

        <div className="absolute -bottom-20 -left-1/2 w-full h-3/5 bg-[#F5F7FF] hidden md:block"/>
        

        {/* Text section */}

        <div className=" h-69 space-y-5">
          <div className="flex items-center gap-2">
            <Minus />
            <p className="font-medium text-sm text-muted-foreground">How we work</p>
          </div>

          <h2
            className=" text-[#4F4F4F
] font-semibold text-[36px] leading-tight"
          >
            Grow Your Business with Momentev
          </h2>

          <p className="text-4 font-normal text-muted-foreground">
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
