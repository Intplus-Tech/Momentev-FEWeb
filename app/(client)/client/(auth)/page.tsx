import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { audienceInfo } from "@/components/sections/auth/auth-screen";
import { Button } from "@/components/ui/button";

const stages = [
  {
    title: "Design brief",
    copy: "Capture goals, budgets, and inspiration boards inside a guided doc shared with planners.",
  },
  {
    title: "Vendor curation",
    copy: "Match with vetted partners and keep each conversation, contract, and payment centralized.",
  },
  {
    title: "Showtime",
    copy: "Collaborative run-of-show timelines and live updates keep your team calm and confident.",
  },
];

export default function ClientPage() {
  const info = audienceInfo.client;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {info.badge}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            A concierge-grade client workspace that keeps every detail aligned.
          </h1>
          <p className="text-base text-slate-600">{info.heroCopy}</p>
          <ul className="grid gap-4">
            {info.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 className="size-5 text-emerald-500" />
                {perk}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/client/sign-up">
                Sign up
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/client/log-in">Already onboarded?</Link>
            </Button>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            {info.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
          <Image
            src={info.heroImage}
            alt="Client collaboration"
            width={1200}
            height={1400}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-900/10" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/40 bg-white/95 p-6 text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Live milestone
            </p>
            <p className="mt-3 text-lg font-semibold">Vendor confirmations</p>
            <p className="text-sm text-slate-500">
              4 of 5 vendors confirmed. Lighting partner pending. Auto reminders
              scheduled.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-6">
        {stages.map((stage) => (
          <div
            key={stage.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {stage.title}
            </p>
            <p className="mt-3 text-base text-slate-600">{stage.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
