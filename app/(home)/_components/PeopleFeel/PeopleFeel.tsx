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

export default function PeopleFeel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      img: "/Daniel-img.png",
      name: "Daniel White",
      location: "Liverpool",
      description:
        '"Booking vendors has never been this easy. Everything in one place."',
    },
    {
      img: "/Amalia-img.png",
      name: "Amelia Samantha",
      location: "Birmingham",
      description:
        '"Booking vendors has never been this easy. Everything in one place."',
    },
    {
      img: "/Alex-img.png",
      name: "Alex Carter",
      location: "London",
      description:
        '"The platform made planning my event stress-free. Highly recommend!"',
    },
    {
      img: "/Alice-img.png",
      name: "Alicia Roberts",
      location: "Manchester",
      description:
        '"Found the perfect vendors for my wedding. The process was seamless."',
    },
    {
      img: "/Daniel-img.png",
      name: "James Mitchell",
      location: "Edinburgh",
      description:
        '"As a vendor, Momentev has helped me reach so many new clients."',
    },
    {
      img: "/Amalia-img.png",
      name: "Sophie Turner",
      location: "Bristol",
      description:
        '"Great experience from start to finish. Will definitely use again!"',
    },
    {
      img: "/Alex-img.png",
      name: "Oliver Brown",
      location: "Leeds",
      description:
        '"The verification process was quick and I\'m now getting regular bookings."',
    },
    {
      img: "/Alice-img.png",
      name: "Emma Wilson",
      location: "Glasgow",
      description:
        '"Love how easy it is to manage all my event vendors in one dashboard."',
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
    <section className="bg-[#F0F0F0] w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col space-y-6">
        {/* Title */}
        <div className="flex items-center justify-center">
          <p className="font-semibold text-lg">
            What people feel with Momentev
          </p>
        </div>

        {/* Carousel */}
        <div className="w-full px-6 md:px-12">
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
                  className="pl-5 md:basis-1/2 lg:basis-1/4"
                >
                  <div className="w-full space-y-3">
                    <div className="relative w-full aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={testimonial.img}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <p className="font-semibold text-base text-[#142141]">
                      {testimonial.name}
                    </p>

                    <p className="text-sm text-gray-700">
                      {testimonial.location}
                    </p>

                    <div className="text-xs text-gray-700 leading-relaxed">
                      <p>{testimonial.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
          </Carousel>

          {/* Dot Navigation */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === current ? "bg-primary" : "bg-gray-300"
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
