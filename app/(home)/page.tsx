import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Stars,
  UsersRound,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Experiences shipped", value: "3,200+" },
  { label: "Cities covered", value: "47" },
  { label: "Verified vendors", value: "1,100" },
];

const flows = [
  {
    title: "Client onboarding",
    copy: "Brief templates, chat, and co-planning tools tuned for discerning hosts.",
    href: "/client/sign-up",
  },
  {
    title: "Vendor workspace",
    copy: "Portfolio showcases, availability sync, and payout automation.",
    href: "/vendor/sign-up",
  },
  {
    title: "Shared verification",
    copy: "Centralized KYC, compliance, and insurance tracking for every party.",
    href: "/client/email-verification",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 lg:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/client" className="hover:text-slate-900">
            Clients
          </Link>
          <Link href="/vendor" className="hover:text-slate-900">
            Vendors
          </Link>
          <Link href="/client/log-in" className="hover:text-slate-900">
            Sign in
          </Link>
          <Link href="/vendor/sign-up" className="hover:text-slate-900">
            Join the network
          </Link>
        </nav>
        <Button className="hidden md:inline-flex" asChild>
          <Link href="/client/sign-up">Start planning</Link>
        </Button>
      </header>

      <main className="space-y-24 pb-16">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
          <div className="space-y-10">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <BadgeCheck className="size-4 text-sky-500" />
              Trusted by boutique planners worldwide
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Momentev
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
                Design unforgettable events that resonate deeply with every
                guest.
              </h1>
              <p className="mt-6 text-lg text-slate-600 lg:max-w-xl">
                A shared workspace where clients, vendors, and producers
                co-create immersive experiences. Apply once, get verified, and
                collaborate with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="px-6" asChild>
                <Link href="/client/sign-up">
                  Client sign up
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-6" asChild>
                <Link href="/vendor/sign-up">Become a vendor</Link>
              </Button>
            </div>
            <div className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur lg:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1520854220072-3da5fb6d82c0?auto=format&fit=crop&w=1100&q=80"
              alt="Bridal fitting"
              width={1100}
              height={1400}
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/95 p-6 shadow-2xl">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <Logo
                  withWordmark={false}
                  compact
                  className="text-base font-semibold"
                />
                <span>Onboarding form</span>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Company name
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    Majestic Moments
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="text-base text-slate-900">
                    jonas.khanwald@gmail.com
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
                  Verification ready
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-6">
          {flows.map((flow) => (
            <Link
              key={flow.title}
              href={flow.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {flow.title}
                </h3>
                <ArrowRight className="size-5 text-slate-400 transition group-hover:text-slate-900" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{flow.copy}</p>
            </Link>
          ))}
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:flex-row lg:px-6">
          <div className="flex-1 rounded-3xl border border-slate-200 from-sky-500 via-indigo-500 to-blue-700 p-10 text-white shadow-xl">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              <Stars className="size-5" />
              Client view
            </div>
            <h3 className="mt-6 text-3xl font-semibold leading-snug">
              Apply, get verified, and start collaborating with curated vendors.
            </h3>
            <p className="mt-4 text-white/80">
              Transparent milestones, AI-suggested briefs, and white-glove
              onboarding wrapped inside a beautiful client dashboard.
            </p>
            <div className="mt-6 grid gap-4 text-sm">
              <div className="flex items-center gap-3">
                <UsersRound className="size-5" />
                Shared workspace for teams and planners
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-5" />
                Live run-of-show timelines
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="mt-8 w-fit"
              asChild
            >
              <Link href="/client/log-in">Enter client portal</Link>
            </Button>
          </div>

          <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              <UsersRound className="size-5 text-amber-500" />
              Vendor view
            </div>
            <h3 className="mt-6 text-3xl font-semibold leading-snug text-slate-900">
              Showcase your craft, sync availability, and close opportunities
              faster.
            </h3>
            <p className="mt-4 text-slate-500">
              Vendor-specific journeys include media-rich portfolios, payout
              vaults, and compliance once for all clients.
            </p>
            <div className="mt-6 grid gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-emerald-500" />
                Global insurance & compliance tracking
              </div>
              <div className="flex items-center gap-3">
                <Stars className="size-5 text-yellow-400" />
                Showcase-ready media sets
              </div>
            </div>
            <Button variant="outline" size="lg" className="mt-8 w-fit" asChild>
              <Link href="/vendor/log-in">Open vendor portal</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
