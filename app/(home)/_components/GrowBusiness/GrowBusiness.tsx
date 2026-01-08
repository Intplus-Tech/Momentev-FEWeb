import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function GrowBusiness() {
  return (
    <section className="container max-w-5xl mx-auto px-4 md:px-10 xl:px-0 mb-10 md:mb-40 relative">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 ">
        {/* Image section */}

        {/* Book image */}
        <Image
          src="/GrowBusiness-img.png"
          alt="Book image"
          width={400}
          height={400}
          className="relative z-10 hidden md:block"
        />

        <div className="absolute -bottom-20 -left-1/2 w-full h-3/5 hidden md:block" />

        {/* Text section */}

        <div className=" h-69 space-y-5">
          <div className="flex items-center gap-2">
            <Minus />
            <p className="font-medium text-sm text-muted-foreground">
              How we work
            </p>
          </div>

          <h2 className=" font-semibold text-xl md:text-[36px] leading-tight">
            Grow Your Business with Momentev
          </h2>

          <p className="text-4 font-normal text-muted-foreground">
            Vendors get a simple way to showcase their services, attract new
            clients, and manage bookings — all in one platform built for
            convenience.
          </p>

          <Button asChild>
            <Link href="/vendor/auth/sign-up">List your business</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
