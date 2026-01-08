import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BookedServices() {
  return (
    <section className="container max-w-5xl mx-auto px-4 md:px-10 xl:px-0 mb-40 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Text section */}
        <div className="flex flex-col justify-center gap-6">
          <div className="flex items-center gap-2">
            <Minus className="text-muted-foreground" />
            <p className="font-medium text-sm text-muted-foreground">
              How we work
            </p>
          </div>

          <h2 className="font-semibold text-xl md:text-[36px] leading-tight">
            Book Services Instantly
          </h2>

          <p className="text-4 font-normal text-muted-foreground">
            Find trusted vendors near you and book them in real time. From
            photographers to caterers, everything you need for your event or
            lifestyle is just a click away.
          </p>

          <Button asChild>
            <Link href="/search">Find Vendors</Link>
          </Button>
        </div>

        {/* Image section */}
        <div className="flex flex-col items-center mt-20">
          {/* Book image */}
          <Image
            src="/Book-img.png"
            alt="Book image"
            width={400}
            height={400}
            className="relative z-10"
          />

          <div className="absolute -bottom-20 -right-1/2 w-full h-3/5 bg-[#F5F7FF]" />
        </div>
      </div>
    </section>
  );
}
