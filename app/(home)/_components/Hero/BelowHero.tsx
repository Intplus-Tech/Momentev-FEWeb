import Logo from "@/components/brand/logo";
import LogoSmall from "@/components/brand/LogoSmall";

export default function BelowHero() {
  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-0 py-10">
        <div className="flex flex-wrap justify-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Event photographers</p>
            <LogoSmall />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Makeup Artists</p>
            <LogoSmall />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Caterers</p>
            <LogoSmall />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">DJs / Musicians</p>
            <LogoSmall />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">Event planners</p>
            <LogoSmall />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white whitespace-nowrap">
              Decorators / Floral Designers
            </p>
            <LogoSmall />
          </div>
        </div>
      </div>
    </section>
  );
}
