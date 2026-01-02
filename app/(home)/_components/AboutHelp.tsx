"use client";

export default function AboutHelp() {
  return (
    <section className="bg-[#FFFFFF] p-10">
      <div className="relative flex flex-col md:flex-row items-center md:justify-between py-10 gap-10 md:gap-0">

        {/* Item 1 */}
        <div className="text-[#0F0202] space-y-5 md:text-left text-center">
          <h3 className="text-[25px] w-[320px] mx-auto md:mx-0 font-semibold">
            Looking to showcase your talent to the right clients?
          </h3>
          <a href="#" className="text-[18px] text-[#0F0202] underline">
            Join our vendors listing
          </a>
        </div>

        {/* Divider 1 */}
        <div className="hidden md:block absolute left-1/4 top-1/2 -translate-y-1/2">
          <div className="w-[167px] border border-[#05717A] rotate-[-90deg]" />
        </div>

        {/* Item 2 */}
        <div className="text-[#0F0202] space-y-5 md:text-center text-center">
          <h3 className="text-[25px] w-[320px] mx-auto font-semibold">
            Frustrated with slow referrals and hard-to-find event professionals?
          </h3>
          <a href="#" className="text-[18px] text-[#0F0202] underline">
            Browse our catalogue
          </a>
        </div>

        {/* Divider 2 */}
        <div className="hidden md:block absolute left-2/3 top-1/2 -translate-y-1/2">
          <div className="w-[167px] border border-[#05717A] rotate-[-90deg]" />
        </div>

        {/* Item 3 */}
        <div className="text-[#0F0202] space-y-5 md:text-right text-center">
          <h3 className="text-[25px] w-[320px] mx-auto md:mx-0 font-semibold">
            Want more visibility and <span className="block">bookings</span>
          </h3>
          <a href="#" className="text-[18px] text-[#0F0202] underline">
            Get started
          </a>
        </div>
        

      </div>
    </section>
  );
}
