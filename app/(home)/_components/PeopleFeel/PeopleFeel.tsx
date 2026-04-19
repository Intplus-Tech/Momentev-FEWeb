"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PeopleFeel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      img: "/Daniel-img.png",
      name: "Daniel White",
      location: "Liverpool",
      role: "Event Planner",
      description:
        "Booking vendors has never been this easy. Everything in one place.",
    },
    {
      img: "/Amalia-img.png",
      name: "Amelia Samantha",
      location: "Birmingham",
      role: "Wedding Coordinator",
      description:
        "Booking vendors has never been this easy. Everything in one place.",
    },
    {
      img: "/Alex-img.png",
      name: "Alex Carter",
      location: "London",
      role: "Client",
      description:
        "The platform made planning my event stress-free. Highly recommend!",
    },
    {
      img: "/Alice-img.png",
      name: "Alicia Roberts",
      location: "Manchester",
      role: "Bride",
      description:
        "Found the perfect vendors for my wedding. The process was seamless.",
    },
    {
      img: "/Daniel-img.png",
      name: "James Mitchell",
      location: "Edinburgh",
      role: "Vendor",
      description:
        "As a vendor, Momentev has helped me reach so many new clients.",
    },
    {
      img: "/Amalia-img.png",
      name: "Sophie Turner",
      location: "Bristol",
      role: "Client",
      description:
        "Great experience from start to finish. Will definitely use again!",
    },
    {
      img: "/Alex-img.png",
      name: "Oliver Brown",
      location: "Leeds",
      role: "Vendor",
      description:
        "The verification process was quick and I'm now getting regular bookings.",
    },
    {
      img: "/Alice-img.png",
      name: "Emma Wilson",
      location: "Glasgow",
      role: "Event Host",
      description:
        "Love how easy it is to manage all my event vendors in one dashboard.",
    },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="bg-white w-full py-14 md:py-20">
      <div className="w-full max-w-none mx-auto px-4 md:px-8 flex flex-col space-y-8">
        <div className="flex items-center justify-center">
          <p className="font-semibold text-base md:text-lg text-[#13254e] text-center">
            What people feel with Momentev
          </p>
        </div>

        <div className="w-full px-0 md:px-4 lg:px-8 xl:px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-5">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-5 basis-full sm:basis-4/5 md:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                >
                  <div className="relative mx-auto w-full max-w-120 overflow-visible">

                    <div className="absolute -top-8 right-12 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-3xl">
                      <Image
                        src={"/assets/svg/colon.svg"}
                        alt="Quote"
                        width={24}
                        height={24}
                      />
                    </div>

                    <div className="relative z-10 h-full p-6 rounded-2xl border bg-white mt-8">
                      <div className="flex h-full flex-col justify-between gap-8">
                        <p className="text-sm md:text-base leading-7 mt-6 pr-8">
                          {testimonial.description}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full shrink-0 border border-[#e5e7eb]">
                            <Image
                              src={testimonial.img}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-[#111827] text-sm md:text-base leading-none">
                              {testimonial.name}
                            </p>
                            <p className="text-xs md:text-sm text-[#6b7280] mt-1">
                              {testimonial.role}
                            </p>
                            {/* <p className="text-xs md:text-sm text-[#6b7280]">
                              {testimonial.location}
                            </p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious>
              <span className="sr-only">Previous</span>
              <ArrowLeft />
            </CarouselPrevious>
            <CarouselNext>
              <span className="sr-only">Next</span>
              <ArrowRight />
            </CarouselNext>
          </Carousel>

          <div className="flex justify-center items-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${index === current ? "bg-[#1d6bff]" : "bg-[#d1d5db]"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
