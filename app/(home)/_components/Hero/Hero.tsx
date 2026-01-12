"use client";

import { useState, useEffect } from "react";
import { CircleUserIcon } from "lucide-react";
import HeroMiddle from "./HeroMiddle";
import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <section className="relative bg-[url('/hero-bg.png')] bg-cover bg-center min-h-screen md:min-h-fit xl:min-h-screen w-full font-inter flex flex-col">
      {/* Navbar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 lg:py-6 z-50 transition-all duration-300",
          isScrolled
            ? "bg-black/70 backdrop-blur-md py-3 lg:py-4 shadow-lg"
            : "bg-transparent"
        )}
      >
        <Logo variant="mixed" className="text-white" />

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-white text-sm">
          <li>
            <button className="relative px-3 py-2 font-medium group">
              <span className="relative z-10 transition-colors duration-200 group-hover:text-primary">
                Post A Request
              </span>
              <span className="absolute inset-0 bg-white/0 rounded-lg transition-all duration-200 group-hover:bg-white/10" />
            </button>
          </li>

          <li>
            <Button
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
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
            <Button
              asChild
              className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Link href="/vendor/auth/sign-up">List your Business</Link>
            </Button>
          </li>
        </ul>

        {/* Mobile Hamburger - Animated */}
        <button
          className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span
              className={cn(
                "w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center",
                menuOpen && "rotate-45 translate-y-[9px]"
              )}
            />
            <span
              className={cn(
                "w-full h-0.5 bg-white rounded-full transition-all duration-300",
                menuOpen && "opacity-0 scale-0"
              )}
            />
            <span
              className={cn(
                "w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center",
                menuOpen && "-rotate-45 -translate-y-[9px]"
              )}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 bg-white lg:hidden z-40 shadow-2xl transition-all duration-500 ease-out",
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="pt-20 pb-8 px-6">
          <ul className="flex flex-col items-center gap-4">
            <li
              className={cn(
                "w-full max-w-xs transition-all duration-300",
                menuOpen
                  ? "translate-y-0 opacity-100 delay-100"
                  : "-translate-y-4 opacity-0"
              )}
            >
              <button className="w-full py-3 font-medium text-foreground hover:text-primary transition-colors text-center">
                Post A Request
              </button>
            </li>

            <li
              className={cn(
                "w-full max-w-xs transition-all duration-300",
                menuOpen
                  ? "translate-y-0 opacity-100 delay-150"
                  : "-translate-y-4 opacity-0"
              )}
            >
              <Button
                className="w-full"
                variant="outline"
                asChild
                onClick={() => setMenuOpen(false)}
              >
                <Link href="/client/auth/log-in">
                  <CircleUserIcon className="w-4 h-4" />
                  Sign in/Sign up
                </Link>
              </Button>
            </li>

            <li
              className={cn(
                "w-full max-w-xs transition-all duration-300",
                menuOpen
                  ? "translate-y-0 opacity-100 delay-200"
                  : "-translate-y-4 opacity-0"
              )}
            >
              <Button
                className="w-full"
                asChild
                onClick={() => setMenuOpen(false)}
              >
                <Link href="/vendor/auth/sign-up">List your Business</Link>
              </Button>
            </li>
          </ul>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Hero Content */}
      <div className="flex-1 flex items-center">
        <HeroMiddle />
      </div>
    </section>
  );
};

export default Hero;
