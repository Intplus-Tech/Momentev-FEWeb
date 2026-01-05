"use client";

import { Home } from "lucide-react";

export default function ContactHero() {
  return (
    <section className="bg-gray-200 flex flex-col items-center min-h-screen overflow-x-hidden">
      <div className="flex flex-col items-center py-20 px-4 sm:px-10 md:px-[140px] space-y-20 w-full">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-5 text-sm sm:text-base w-full max-w-[1026px]">
          <button>
            <Home className="text-primary" />
          </button>
          <p>/</p>
          <button className="text-[#142141]">Search</button>
          <p>/</p>
          <button>
            <strong>Contact</strong>
          </button>
        </div>

        {/* Content */}
        <div className="w-full max-w-[1026px] space-y-5">
          <div className="flex flex-col lg:flex-row lg:space-x-20 space-y-10 lg:space-y-0">

            {/* Left Content */}
            <div className="space-y-5 w-full max-w-[440px]">
              <div>
                <h2 className="font-semibold text-[#000000] text-[30px]">
                  Lets Talk
                </h2>
                <p className="text-[#000000] text-[14px]">
                  Have a question, suggestion, or need support? Reach out to us and
                  our team will get back to you promptly.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-[#000000] text-[30px]">
                  Support
                </h2>
                <p className="text-[#000000] text-[14px]">
                  support@momentev.com
                </p>
                <p className="text-[#000000] text-[14px]">
                  +44 787 337 1393
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-[#000000] text-[30px]">
                  Socials
                </h2>
                <p className="underline text-[#000000] text-[14px]">
                  Instagram
                </p>
                <p className="underline text-[#000000] text-[14px]">
                  Twitter
                </p>
                <p className="underline text-[#000000] text-[14px]">
                  Facebook
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="w-full lg:w-[726px] space-y-5">
              <form>
                <div>
                  <label>
                    <div className="text-[14px] text-[#000000] pb-2">
                      Name
                    </div>
                    <input
                      type="text"
                      name="name"
                      className="border border-[#D7D7D7] w-full max-w-[526px] h-[46px] bg-[#FFFFFF]"
                    />
                  </label>
                </div>

                <div className="pt-5">
                  <label>
                    <div className="text-[14px] text-[#000000] pb-2">
                      Email
                    </div>
                    <input
                      type="email"
                      name="email"
                      className="border border-[#D7D7D7] w-full max-w-[526px] h-[46px] bg-[#FFFFFF]"
                    />
                  </label>
                </div>

                <div className="pt-5">
                  <label>
                    <div className="text-[14px] text-[#000000] pb-2">
                      Message
                    </div>
                    <textarea
                      className="border border-[#D7D7D7] bg-[#FFFFFF] w-full max-w-[528px] h-[165px]"
                    />
                  </label>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
