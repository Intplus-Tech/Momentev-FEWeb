"use client";

import { useState } from "react";
import { CircleUserIcon, Menu } from "lucide-react";
import HeroMiddle from "./HeroMiddle";
import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="bg-[url('/hero-bg.png')] bg-cover bg-center h-screen w-full font-inter ">
      <nav className="flex items-center justify-between px-6 md:px-20 py-10 relative">
        <Logo variant="mixed" className="text-white" />

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-6 text-white text-[14px]">
          <li>Post A Request</li>

          <li>
            <Button className="bg-white/25" asChild>
              <Link href="/client/auth/log-in">
                <CircleUserIcon /> Sign in/Sign up
              </Link>
            </Button>
          </li>

          <li>
            <Button asChild>
              <Link href="/vendor/auth/sign-up">List your Business</Link>
            </Button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <Button
          className="md:hidden bg-transparent"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          variant={"ghost"}
          size="icon"
        >
          <Menu className="text-white" />
        </Button>

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
        <HeroMiddle />
      </div>
    </section>
  );
};

export default Hero;
