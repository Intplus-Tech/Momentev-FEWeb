import { Logo } from "@/components/brand/logo";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="max-w-6xl mx-auto px-6 md:px-0 py-10 bg-[#3E4550] space-y-10">

        {/* Logo + Social Icons */}
        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-6 md:space-y-0">
          <Logo className="text-white text-[54px]" />

          <div className="flex gap-4">
           

            {/* Other social icons without background */}
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
        <div className="text-white flex flex-wrap gap-8 text-[13px] font-medium md:justify-start ">
          <button>About US</button>
          <button>FAQS</button>
          <button>Privacy Policy</button>
          <button>Terms of Services</button>
          <button>Contacts</button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-between">
        <div className="w-full h-[2px] bg-white"></div>

        {/* App Images */}
        <div className="flex flex-col  gap-4 justify-center mt-4">
          <Image src="/Apple-img.png" alt="Apple Store" width={134} height={40} />
          <Image src="/Google-img.png" alt="Google Play Store" width={134} height={40} />
        </div>
        </div>
        <div className="mt-10 text-white">
          <p>© Copyright 2025, All Rights Reserved Momentev</p>
        </div>
      </div>
    </footer>
  );
}
