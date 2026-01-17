"use client";

import LogoSmall from "@/components/brand/LogoSmall";

const items = [
  "Event photographers",
  "Makeup Artists",
  "Caterers",
  "DJs / Musicians",
  "Event planners",
  "Decorators / Floral Designers",
];

export default function BelowHero() {
  return (
    <section className="bg-black hidden lg:block overflow-hidden py-4">
      {/* Inline styles for the marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full">
        {/* Inner container with double width for seamless looping */}
        <div className="flex w-max animate-marquee">
          {/* First set of items */}
          <div className="flex gap-12 px-6">
            {items.map((item, index) => (
              <div key={`a-${index}`} className="flex items-center gap-4">
                <p className="text-white text-sm whitespace-nowrap uppercase tracking-wider font-medium">
                  {item}
                </p>
                <LogoSmall size={28} />
              </div>
            ))}
          </div>

          {/* Second set of items (duplicate for loop) */}
          <div className="flex gap-12 px-6">
            {items.map((item, index) => (
              <div key={`b-${index}`} className="flex items-center gap-4">
                <p className="text-white text-sm whitespace-nowrap uppercase tracking-wider font-medium">
                  {item}
                </p>
                <LogoSmall size={28} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
