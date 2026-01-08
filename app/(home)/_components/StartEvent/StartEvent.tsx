import {
  MapPin,
  CalendarCheck,
  Hotel,
  CircleUser,
  Check,
  PoundSterling,
} from "lucide-react";
import Image from "next/image";

export default function StartEvent() {
  return (
    <section className="pb-18">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 lg:items-start">
        {/* Attendee side */}
        <div className="space-y-6">
          <div className="rounded-[18px] bg-[#2141E6] p-5 shadow-[0_12px_38px_rgba(18,37,90,0.16)]">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-[#123]">
              <Image
                src="/Book-img.png"
                alt="Start your event"
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 space-y-1 text-white">
              <p className="text-xl font-semibold leading-tight">
                Start your event on Momentev
              </p>
              <p className="text-xs text-white/90">
                Discover trusted vendors, book in seconds, and keep everything
                in one place.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Step
              icon={<MapPin className="h-5 w-5 text-primary" />}
              title="Search"
              description="Browse verified vendors across events and services."
              accent="primary"
            />
            <Step
              icon={<CalendarCheck className="h-5 w-5 text-primary" />}
              title="Book"
              description="Pick your slot, confirm instantly."
              accent="primary"
            />
            <Step
              icon={<Hotel className="h-5 w-5 text-primary" />}
              title="Show up"
              description="Everything’s ready when you are."
              accent="primary"
            />
          </div>
        </div>

        {/* Vendor side */}
        <div className="space-y-6">
          <div className="rounded-[18px] bg-[#FAD53C] p-5 shadow-[0_12px_38px_rgba(18,37,90,0.16)]">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-[#f7e38c]">
              <Image
                src="/GrowBusiness-img.png"
                alt="Grow with Momentev"
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-xl font-semibold leading-tight">
                Grow with Momentev
              </p>
              <p className="text-xs text-muted-foreground">
                Get verified, get discovered, and turn your services into steady
                bookings.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Step
              icon={<CircleUser className="h-5 w-5 text-foreground" />}
              title="Apply"
              description="Create your profile and submit verification."
            />
            <Step
              icon={<Check className="h-5 w-5 text-foreground" />}
              title="Get verified"
              description="Once approved, your services go live."
            />
            <Step
              icon={<PoundSterling className="h-5 w-5 text-foreground" />}
              title="Earn"
              description="Receive bookings, reviews, and payments seamlessly."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type StepProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "primary";
};

function Step({ icon, title, description, accent }: StepProps) {
  const ringColor =
    accent === "primary"
      ? "border-primary text-primary"
      : "border-[#1d2741] text-muted-foreground";

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${ringColor}`}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-[#4F4F4F]">{description}</p>
      </div>
    </div>
  );
}
