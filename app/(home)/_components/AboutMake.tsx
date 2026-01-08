"use client";

export default function AboutMake() {
  return (
    <section className="bg-[#F0F0F0] w-full py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="text-foreground text-2xl md:text-3xl font-semibold text-center">
            How we make it happen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step
            number={1}
            title="Verified Professionals"
            description="We onboard and review service providers so you’re choosing from skilled, reliable, and trusted experts."
          />
          <Step
            number={2}
            title="Smart Search & Discovery"
            description="Filter by location, service type, budget, and reviews — making it easy to find exactly who you need."
          />
          <Step
            number={3}
            title="Seamless Connection"
            description="Direct enquiries, quick responses, and smooth bookings bring convenience and clarity to your planning."
          />
        </div>
      </div>
    </section>
  );
}

type StepProps = {
  number: number;
  title: string;
  description: string;
};

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#142141] text-white font-semibold">
        {number}
      </div>
      <p className="text-lg md:text-xl font-semibold text-foreground">
        {title}
      </p>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[360px]">
        {description}
      </p>
    </div>
  );
}
