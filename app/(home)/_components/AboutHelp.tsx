"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function AboutHelp() {
  return (
    <section className="bg-white w-full py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          <HelpCard
            align="start"
            title="Looking to showcase your talent to the right clients?"
            link="Join our vendors listing"
            href="/vendor/auth/log-in"
          />

          <Divider />

          <HelpCard
            align="center"
            title="Frustrated with slow referrals and hard-to-find event professionals?"
            link="Browse our catalogue"
            href="/search"
          />

          <Divider />

          <HelpCard
            align="end"
            title="Want more visibility and bookings?"
            link="Get started"
            href="/client/auth/log-in"
          />
        </div>
      </div>
    </section>
  );
}

type HelpCardProps = {
  align: "start" | "center" | "end";
  title: string;
  link: string;
  href: string;
};

function HelpCard({ align, title, link, href }: HelpCardProps) {
  const alignment =
    align === "start"
      ? "md:text-left"
      : align === "end"
      ? "md:text-right"
      : "md:text-center";

  return (
    <div className={`flex-1 space-y-4 text-center ${alignment}`}>
      <h3 className="text-2xl text-foreground font-semibold leading-snug">
        {title}
      </h3>
      <Link href={href} className="text-lg text-primary underline font-medium">
        {link}
      </Link>
    </div>
  );
}

function Divider() {
  return (
    <div className="hidden md:flex self-stretch items-center">
      <Separator orientation="vertical" className="h-28 w-px bg-gray-200" />
    </div>
  );
}
