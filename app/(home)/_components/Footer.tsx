"use client";


import Logo from "@/components/brand/logo";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-[#3E4550]">
      <div className="max-w-6xl mx-auto px-6 md:px-0 py-10  space-y-10">
        {/* Logo + Social Icons */}
        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-6 md:space-y-0">
          {/* <Logo className="text-white text-[54px]" /> */}
          <Logo className="text-white text-[54px]" />

          <div className="flex gap-4">
            <button className="flex items-center justify-center w-[44px] h-[44px]">
              <Twitter className="text-white w-[23px] h-[23px]" />
            </button>

            <button className="flex items-center justify-center w-[44px] h-[44px] p-2 rounded-full bg-primary">
              <Facebook className="text-white w-[23px] h-[23px]" />
            </button>

            <button className="flex items-center justify-center w-[44px] h-[44px]">
              <Instagram className="text-white w-[23px] h-[23px]" />
            </button>

            <button className="flex items-center justify-center w-[44px] h-[44px]">
              <Github className="text-white w-[23px] h-[23px]" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-white flex flex-wrap gap-8 text-[13px] font-medium md:justify-start">
          <button onClick={() => router.push("/about")}>About US</button>
          <button onClick={() => router.push("/faqs")}>FAQS</button>
          <button onClick={() => router.push("/privacy-policy")}>
            Privacy Policy
          </button>
          <button onClick={() => router.push("/terms-and-conditions")}>
            Terms of Services
          </button>
          <button onClick={() => router.push("/contact")}>Contacts</button>
        </div>

        {/* Divider + App Images */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
          {/* Divider */}
          <div className="w-full h-[2px] bg-white"></div>

          {/* App Images */}
          <div className="flex flex-col gap-4 justify-center items-center md:items-start mt-4 md:mt-0">
            <Image
              src="/Apple-img.png"
              alt="Apple Store"
              width={134}
              height={40}
            />
            <Image
              src="/Google-img.png"
              alt="Google Play Store"
              width={134}
              height={40}
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 text-white md:text-left">
          <p>© Copyright 2025, All Rights Reserved Momentev</p>
        </div>
      </div>
    </footer>
  );
}
