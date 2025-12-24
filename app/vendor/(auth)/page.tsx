import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { audienceInfo } from "@/components/sections/auth/auth-screen";
import { Button } from "@/components/ui/button";

const highlights = [
  "Portfolio gallery with drag-and-drop curation",
  "Availability sync with Google Calendar and Apple Calendar",
  "Automated payouts, W-9 collection, and insurance reminders",
];

export default function VendorPage() {
  const info = audienceInfo.vendor;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 pb-16 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {info.badge}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            Showcase your craft and join a curated network of premium events.
          </h1>
          <p className="text-base text-slate-600">{info.heroCopy}</p>
          <ul className="space-y-4 text-sm text-slate-600">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/vendor/sign-up">
                Join the network
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor/log-in">Vendor login</Link>
            </Button>
          </div>
          <div className="grid gap-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-sm text-slate-700">
            {info.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between"
              >
                <span className="font-semibold">{stat.value}</span>
                <span className="text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
          <Image
            src={info.heroImage}
            alt="Vendor collaboration"
            width={1300}
            height={1500}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-4 rounded-2xl bg-white/95 p-6 text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Incoming brief
            </p>
            <p className="text-lg font-semibold">
              Editorial reception · New York
            </p>
            <div className="flex items-center justify-between text-sm">
              <span>Budget</span>
              <strong>$22,000</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Response SLA</span>
              <strong>4 hours</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
