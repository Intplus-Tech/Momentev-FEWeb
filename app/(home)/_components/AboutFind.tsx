"use client";
import Image from "next/image";

export default function AboutFind() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Text */}
          <div className="space-y-5 w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              Find the Right People, Fast
            </h2>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              At Momentev, we&apos;re redefining how people find event services.
              No more relying on scattered referrals or scrolling endlessly
              through social media.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Our platform brings together verified professionals across every
              category — making it easier for you to search by location,
              discover trusted experts, and connect quickly with the right
              people for your event.
            </p>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <Image
              src="/aboutfind-img.png"
              alt="Find the Right People"
              width={517}
              height={357}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
