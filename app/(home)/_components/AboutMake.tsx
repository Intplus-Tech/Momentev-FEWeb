"use client";

export default function AboutMake() {
  return (
    <section className="bg-gray-200 p-10 py-15">
      <div className="space-y-10">
        <div className="flex flex-col items-center">
          <h2 className="text-[#0F0202] text-[30px] text-center">
            How we make it happen
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:justify-between gap-10">
          {/* Step 1 */}
          <div className="max-w-[400px] flex flex-col items-center space-y-5">
            <div className="bg-black p-5 rounded-lg w-[60px] h-[60px] text-white flex items-center justify-center">
              1
            </div>
            <p className="text-[24px] font-semibold text-[#0F0202] text-center">
              Verified Professionals
            </p>
            <p className="text-center">
              We onboard and review service providers to ensure you’re choosing
              from skilled, reliable, and trusted <span className="block">experts.</span>
            </p>
          </div>

          {/* Step 2 */}
          <div className="max-w-[400px] flex flex-col items-center space-y-5">
            <div className="bg-black p-5 rounded-lg w-[60px] h-[60px] text-white flex items-center justify-center">
              2
            </div>
            <p className="text-[24px] font-semibold text-[#0F0202] text-center">
              Smart search & Discovery
            </p>
            <p className="text-center">
              Our platform helps you filter by location, service type, budget, and reviews — making it easy to find exactly  <span className="block">who you need.</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="max-w-[400px] flex flex-col items-center space-y-5">
            <div className="bg-black p-5 rounded-lg w-[60px] h-[60px] text-white flex items-center justify-center">
              3
            </div>
            <p className="text-[24px] font-semibold text-[#0F0202] text-center">
              Seamless Connection
            </p>
            <p className="text-center">
              We simplify communication by enabling direct enquiries, quick responses, and smooth booking processes, bringing convenience and clarity to your  <span className="block">planning.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
