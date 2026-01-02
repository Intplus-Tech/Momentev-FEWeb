"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import Logo from "@/components/brand/logo";

type AuthScreenProps = {
  component: ReactNode;
  mainText?: string;
  subText?: string;
};

const slides = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1554080353-321e452ccf19?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1561478274-b31cda82062e?q=80&w=1129&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Sparkler send-off at a night wedding",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1666602707766-58693ea038d7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Elegant outdoor reception tablescape",
  },
];

export function ClientAuthScreen({
  component,
  mainText,
  subText,
}: AuthScreenProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);

    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      if (!emblaApi) return;
      emblaApi.scrollNext();
    }, 6000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="relative min-h-screen bg-white">
      <Logo className="absolute left-6 top-6 z-20 h-8 w-auto hidden xl:block" />

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="order-2 flex items-center justify-center px-4 py-12 sm:px-8 lg:order-1 lg:px-16">
          <div className="w-full max-w-md lg:max-w-sm px-8 xl:px-0">
            <div className="lg:hidden mb-10 flex items-center justify-center pr-12">
              <Logo className="mb-8 w-auto mx-auto" />
            </div>
            {component}
          </div>
        </div>

        <div className="hidden xl:block relative order-1 h-[55vh] min-h-80 overflow-hidden lg:order-2 lg:h-[98vh] mr-2 rounded-2xl my-auto">
          <div className="relative h-full" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((slide) => (
                <div key={slide.id} className="relative h-full min-w-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt ?? "Auth screen slide"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* {(mainText || subText) && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end p-8">
              <div className="max-w-md rounded-3xl bg-black/30 p-6 text-white backdrop-blur-md">
                {mainText && (
                  <p className="text-3xl font-semibold leading-tight">
                    {mainText}
                  </p>
                )}
                {subText && (
                  <p className="mt-3 text-base text-white/80">{subText}</p>
                )}
              </div>
            </div>
          )} */}

          {/* <button
            type="button"
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button> */}

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
