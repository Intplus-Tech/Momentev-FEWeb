import { Logo } from "@/components/brand/logo";

export default function BelowHero() {
  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-0 py-10">
        <div className="flex flex-wrap justify-center md:justify-between gap-6">

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Event photographers</p>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Makeup Artists</p>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Caterers</p>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">DJs / Musicians</p>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Event planners</p>
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">
              Decorators / Floral Designers
            </p>
            <Logo />
          </div>

        </div>
      </div>
    </section>
  );
}
