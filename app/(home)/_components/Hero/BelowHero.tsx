import Logo from "@/components/brand/logo";
import LogoSmall from "@/components/brand/LogoSmall";

export default function BelowHero() {
  return (
    <section className="bg-black hidden lg:block">
      <div className="max-w-7xl mx-auto px-6 md:px-0 py-4">
        <div className="flex flex-wrap justify-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <p className="text-white text-sm whitespace-nowrap">
              Event photographers
            </p>
            <LogoSmall size={28} />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white text-sm whitespace-nowrap">
              Makeup Artists
            </p>
            <LogoSmall size={28} />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white text-sm whitespace-nowrap">Caterers</p>
            <LogoSmall size={28} />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white text-sm whitespace-nowrap">
              DJs / Musicians
            </p>
            <LogoSmall size={28} />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white text-sm whitespace-nowrap">
              Event planners
            </p>
            <LogoSmall size={28} />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-white text-sm  whitespace-nowrap">
              Decorators / Floral Designers
            </p>
            <LogoSmall size={28} />
          </div>
        </div>
      </div>
    </section>
  );
}
