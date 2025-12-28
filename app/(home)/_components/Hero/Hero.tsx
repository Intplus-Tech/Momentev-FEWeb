"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@base-ui/react";
import { CircleUserIcon } from "lucide-react";
import HeroMiddle from "./HeroMiddle";

const Hero = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="bg-[url('/hero-bg.png')] bg-cover bg-center h-screen w-full font-inter ">
      <nav className="flex items-center justify-between px-6 md:px-20 py-10 relative">
        <Logo className="text-white" />

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-6 text-white text-[14px]">
          <li>Post A Request</li>

          <li>
         
            <Button className="bg-white/25 p-2 rounded-lg text-[13px] flex items-center justify-between gap-2"> <CircleUserIcon /> Sign in/Sign up</Button>
          </li>

          <li>
            <Button className="bg-primary p-2 rounded-lg text-[13px]">List your Business</Button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul className="absolute top-full left-0 w-full bg-white md:hidden flex flex-col items-center    space-y-4 py-6 shadow-lg">
            <li>Post A Request</li>

            <li>
              <Button>Sign in/Sign up</Button>
            </li>

            <li>
              <Button className="bg-primary">List your Business</Button>
            </li>
          </ul>
        )}
      </nav>
      <div>
        <HeroMiddle/>
      </div>
    </section>
  );
};

export default Hero;
