import {
  MapPin,
  ShoppingCart,
  Hotel,
  CircleUser,
  Check,
  PoundSterling,
} from "lucide-react";
import Image from "next/image";

export default function StartEvent() {
  return (
    <section>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 justify-center items-center  max-w-5xl mx-auto px-4 ">
        <div>
          <div className="bg-primary w-full max-w-[420px] sm:max-w-[480px] lg:w-130 lg:max-w-none rounded-2xl">
            <div className="flex items-center justify-center pt-5  ">
              <Image
                src="/Book-img.png"
                alt="rectangle image"
                width={500}
                height={40}
                className="h-70 "
              />
            </div>
            <div className="text-white p-4 space-y-2">
              <p className="flex items-start font-semibold text-[21px]">
                Start your event on Momentev
              </p>
              <p className="text-[11px]">
                Discover trusted vendors, book in seconds, and keep everything
                in one place.
              </p>
            </div>
          </div>
          <div className="p-3 space-y-3 mt-3">
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <MapPin className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Search
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Browse verified vendors across events and services.
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <ShoppingCart className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Book
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Pick your slot, confirm instantly{" "}
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <Hotel className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Show up
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Everything’s ready when you are.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[#FED73E] w-full max-w-[420px] sm:max-w-[480px] lg:w-130 lg:max-w-none rounded-2xl">
            <div className="flex items-center justify-center pt-5  ">
              <Image
                src="/GrowBusiness-img.png"
                alt="rectangle image"
                width={500}
                height={40}
                className="h-70 "
              />
            </div>
            <div className="text-[#142141] p-4 space-y-2">
              <p className="flex items-start font-semibold text-[21px]">
                Grow with Momentev
              </p>
              <p className="text-[11px]">
                Get verified, get discovered, and turn your services into steady
                bookings..
              </p>
            </div>
          </div>
          <div className="p-3 space-y-3 mt-3">
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <CircleUser className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Apply
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Create your profile and submit verification.
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <Check className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Get verified
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Once approved, your services go live.{" "}
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex text-primary font-semibold gap-1">
                <span>
                  <PoundSterling className="text-primary border border-primary p-1 rounded-xl" />
                </span>
                Earn
              </p>

              <p className="text-[#4F4F4F] text-[13px]">
                Receive bookings, reviews, and payments seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
