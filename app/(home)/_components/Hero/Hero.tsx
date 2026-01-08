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
    <section className="relative bg-[url('/hero-bg.png')] bg-cover bg-center min-h-screen md:min-h-fit xl:min-h-screen w-full font-inter flex flex-col">
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-20 py-6 lg:py-10 relative z-50">
        <Logo variant="mixed" className="text-white" />

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-white text-sm">
          <li>
            <button className="hover:text-primary transition-colors font-medium">
              Post A Request
            </button>
          </li>

          <li>
            <Button
              className="bg-white/25 hover:bg-white/35 backdrop-blur-sm"
              asChild
            >
              <Link href="/client/auth/log-in">
                <CircleUserIcon className="w-4 h-4" />
                <span className="hidden xl:inline">Sign in/Sign up</span>
                <span className="xl:hidden">Sign in</span>
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
          className="lg:hidden bg-transparent hover:bg-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          variant="ghost"
          size="icon"
        >
          <Menu className="text-white w-6 h-6" />
        </Button>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul className="absolute top-full left-0 w-full bg-white lg:hidden flex flex-col items-center gap-4 py-6 shadow-lg z-40 animate-in slide-in-from-top">
            <li>
              <button className="font-medium text-foreground hover:text-primary transition-colors">
                Post A Request
              </button>
            </li>

            <li>
              <Button className="w-full max-w-xs" asChild>
                <Link href="/client/auth/log-in">
                  <CircleUserIcon className="w-4 h-4" /> Sign in/Sign up
                </Link>
              </Button>
            </li>

            <li>
              <Button className="bg-primary w-full max-w-xs" asChild>
                <Link href="/vendor/auth/sign-up">List your Business</Link>
              </Button>
            </li>
          </ul>
        )}
      </nav>
      <div className="flex-1 flex items-center">
        <HeroMiddle />
      </div>
    </section>
  );
};

export default Hero;
