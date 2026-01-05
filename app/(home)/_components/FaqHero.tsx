"use client";

import { useState } from "react";
import { Plus, Minus, Home, X } from "lucide-react";

const questions = [
  "What is the 48-hour payout window?",
  "How does the Vendor Ranking Score work?",
  "What happens if something goes wrong with my booking?",
  "Can I communicate with the vendor directly?",
  "Is my money safe?",
  "How does payment work?",
  "Can I sync my calendar to avoid double-booking?",
  "How does commission work?",
  "How do disputes work for vendors?",
];

const answers = [
  "The 48-hour payout window means that once your service is completed, your payment will be processed and available within 48 hours.",
  "Answer 2",
  "Answer 3",
  "Answer 4",
  "Answer 5",
  "Answer 6",
  "Answer 7",
  "Answer 8",
  "Answer 9",
];

export default function FaqHero() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-200 flex flex-col items-center min-h-screen overflow-x-hidden">
      <div className="flex flex-col items-center py-20 px-4 sm:px-10 md:px-[140px] space-y-20 w-full">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 pb-5 text-sm sm:text-base w-full max-w-[1026px]">
          <button><Home className="text-primary" /></button>
          <p>/</p>
          <button className="text-[#142141]">Search</button>
          <p>/</p>
          <button>FAQ</button>
        </div>

        {/* Headline */}
        <div className="w-full max-w-[1026px] space-y-5">
          <p className="text-[#0F0202] text-[24px] sm:text-[30px] font-semibold">
            Everything You Need to Know, All in One Place.
          </p>
          <p className="text-[16px] sm:text-[20px]">
            Got questions about using Momentev? Whether you’re planning an event or offering your services as a vendor, we’ve got you covered.
          </p>
        </div>

        {/* Momentev Block (UI untouched) */}
        <div className="w-full flex justify-center">
          <div className="w-[1026px] max-w-full space-y-2">
            <div className="flex items-center justify-between h-[65px] p-5 bg-white border border-2">
              <p className="text-[18px] font-semibold">What is Momentev?</p>
              <span className="w-[24px] h-[24px]"><X /></span>
            </div>

            <div className="flex items-center justify-between h-[65px] p-5 bg-white border border-2">
              <p className="text-[16px] text-[#3C3C43D9] font-semibold">
                Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis.
              </p>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4 w-full items-center">
          {questions.map((question, index) => (
            <div
              key={index}
              className="w-[1026px] max-w-full border border-gray-300 rounded-md overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full h-[59px] px-5 bg-transparent"
                onClick={() => toggleAccordion(index)}
              >
                <span className="text-[18px] font-medium">{question}</span>
                <span className="text-[#05717A]">
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-5 py-4 bg-transparent text-[16px]">
                  {answers[index]}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
