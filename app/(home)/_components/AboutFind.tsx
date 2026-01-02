"use client";
import Image from "next/image";

export default function AboutFind() {
  return (
    <section className="px-4 sm:px-8 md:px-12 lg:px-0">
      {/* TRUE CENTER WRAPPER */}
      <div className="mx-auto lg:max-w-[1200px]">
        <div
          className="
            flex flex-col-reverse lg:flex-row
            items-center
            justify-center
            py-8 sm:py-12 md:py-16 lg:py-20
            gap-6 sm:gap-8 lg:gap-10
          "
        >
          {/* Text */}
          <div
            className="
              space-y-4 sm:space-y-5
              w-full max-w-[620px] lg:w-[582px]
              text-center lg:text-left
            "
          >
            <h2 className="text-[#0F0202] text-[20px] font-semibold">
              Find the Right People, Fast
            </h2>

            <p className="text-[14px] text-[#2C2C2C] font-medium leading-relaxed">
              At Momentev, we’re redefining how people find event services. No more relying on scattered referrals or scrolling endlessly through social media.
            </p>

            <p className="text-[14px] text-[#2C2C2C] leading-relaxed">
              Our platform brings together verified professionals across every category — making it easier for you to search by location, discover trusted experts, and connect quickly with the right people for your event. We’re building a simple, reliable space where planning becomes clearer, faster, and far less stressful.
            </p>
          </div>

          {/* Image */}
          <div className="w-full flex justify-center lg:block">
            <Image
              src="/aboutfind-img.png"
              alt="About Find"
              width={517}
              height={357}
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
