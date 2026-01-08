"use client";

import Logo from "@/components/brand/logo";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-[#191D23]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Logo + Social Icons */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          <Logo variant="white" className="text-white text-[54px]" />

          <div className="flex gap-3">
            <button className="flex items-center justify-center w-11 h-11 hover:opacity-80 transition-opacity">
              <Twitter className="text-white w-6 h-6" />
            </button>

            <button className="flex items-center justify-center w-11 h-11 rounded-full bg-primary hover:bg-primary/90 transition-colors">
              <Facebook className="text-white w-6 h-6" />
            </button>

            <button className="flex items-center justify-center w-11 h-11 hover:opacity-80 transition-opacity">
              <Instagram className="text-white w-6 h-6" />
            </button>

            <button className="flex items-center justify-center w-11 h-11 hover:opacity-80 transition-opacity">
              <Github className="text-white w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-white flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium">
          <button
            onClick={() => router.push("/about")}
            className="hover:text-primary transition-colors"
          >
            About Us
          </button>
          <button
            onClick={() => router.push("/faqs")}
            className="hover:text-primary transition-colors"
          >
            FAQs
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="hover:text-primary transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => router.push("/terms")}
            className="hover:text-primary transition-colors"
          >
            Terms of Service
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="hover:text-primary transition-colors"
          >
            Contact
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/20"></div>

        {/* App Images + Copyright */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Image
              src="/Apple-img.png"
              alt="Download on the App Store"
              width={134}
              height={40}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Image
              src="/Google-img.png"
              alt="Get it on Google Play"
              width={134}
              height={40}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Copyright */}
          <div className="text-white text-sm text-center md:text-right">
            <p>© Copyright 2025, All Rights Reserved Momentev</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
