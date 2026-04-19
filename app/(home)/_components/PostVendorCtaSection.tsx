import Image from "next/image";
import Link from "next/link";

export default function PostVendorCtaSection() {
  return (
    <section className="bg-background py-14 md:py-20 xl:py-28">
      <div className="max-w-7xl mx-auto lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <article className="relative w-full aspect-[1.44/1] rounded-l-full rounded-r-2xl overflow-hidden border border-white/40 md:border-r-0">
          <Image
            src="/assets/bg-images/first-half.png"
            alt="Post your event"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/42" />

          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6 md:px-8">
            <h3 className="text-white text-3xl md:text-5xl md:leading-tight font-medium">
              Post your event
            </h3>
            <p className="text-white/90 mt-2 text-base md:text-lg max-w-md">
              Get direct messages and quotes from <br /> vendors about your event
            </p>

            <Link
              href="/client/custom-request"
              className="mt-6 inline-flex min-w-52 items-center justify-center rounded-md border border-white/55 bg-white/10 px-7 py-2.5 text-white text-base hover:bg-white/20 transition-colors"
            >
              Post your event
            </Link>
          </div>
        </article>

        <article className="relative w-full aspect-[1.44/1]  rounded-r-full overflow-hidden border border-white/40 md:border-l-0">
          <Image
            src="/assets/bg-images/second-half.jpg"
            alt="Become a Vendor"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/42" />

          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6 md:px-8">
            <h3 className="text-white text-3xl md:text-5xl md:leading-tight font-medium">
              Become a Vendor
            </h3>
            <p className="text-white/90 mt-2 text-base md:text-lg max-w-md">
              Get listed on search results, with <br /> unlimited access to requests.
            </p>

            <Link
              href="/vendor/auth/sign-up"
              className="mt-6 inline-flex min-w-52 items-center justify-center rounded-md border border-white/55 bg-white/10 px-7 py-2.5 text-white text-base hover:bg-white/20 transition-colors"
            >
              Create Vendor&apos;s Account
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}