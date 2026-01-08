"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="bg-[#F0F0F0] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4 text-primary" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">About us</span>
        </nav>

        {/* Hero Content */}
        <div className="space-y-6 text-center md:text-left max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
            Your Moments, Made Effortlessly Simple
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover trusted event service providers around you — from bakers to
            MCs and decorators — all in one seamless platform designed to take
            the stress out of planning your perfect day.
          </p>

          <Button size="lg" className="w-full md:w-auto px-8">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
