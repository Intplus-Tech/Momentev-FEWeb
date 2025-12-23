import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Audience = "client" | "vendor";
export type AuthScreenType =
  | "sign-up"
  | "log-in"
  | "email-verification"
  | "verification-successful"
  | "password-reset";

type AudienceInfo = {
  label: string;
  badge: string;
  heroHeadline: string;
  heroCopy: string;
  heroImage: string;
  color: string;
  perks: string[];
  stats: { label: string; value: string }[];
};

type AuthField = {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
};

type AuthScreenConfig = {
  title: string;
  description: string;
  fields?: AuthField[];
  actionLabel: string;
  helperText?: string;
  layout?: "form" | "status";
  statusIcon?: "success";
  actionHref?: (audience: Audience) => string;
  footerLink: (audience: Audience) => {
    text: string;
    href: string;
    linkLabel: string;
  };
  secondaryLink?: {
    label: string;
    href: (audience: Audience) => string;
  };
  highlight?: string;
};

export const audienceInfo: Record<Audience, AudienceInfo> = {
  client: {
    label: "Client",
    badge: "Client experience",
    heroHeadline: "Design unforgettable experiences",
    heroCopy:
      "Plan premium celebrations, onboard internal teams, and keep curated vendors accountable in a single client-ready workspace.",
    heroImage:
      "https://images.unsplash.com/photo-1520854220072-3da5fb6d82c0?auto=format&fit=crop&w=1200&q=80",
    color: "from-sky-500 via-indigo-500 to-blue-600",
    perks: ["Vision briefs", "Budget dashboards", "White-glove support"],
    stats: [
      { label: "Events fulfilled", value: "2,480+" },
      { label: "Avg. vendor replies", value: "<4 hrs" },
    ],
  },
  vendor: {
    label: "Vendor",
    badge: "Vendor network",
    heroHeadline: "Scale your creative studio",
    heroCopy:
      "Showcase services, collaborate on briefs, and get paid faster with automated contracts, invoices, and verifications.",
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    color: "from-amber-400 via-orange-500 to-rose-500",
    perks: ["Instant leads", "Automated compliance", "Vaulted payouts"],
    stats: [
      { label: "Studios onboarded", value: "1,120" },
      { label: "Avg. project size", value: "$18k" },
    ],
  },
};

const screenConfig: Record<AuthScreenType, AuthScreenConfig> = {
  "sign-up": {
    title: "Create your workspace",
    description:
      "Introduce your brand, invite collaborators, and unlock guided onboarding tailored to your role.",
    actionLabel: "Sign up",
    fields: [
      {
        name: "name",
        label: "Full name",
        type: "text",
        autoComplete: "name",
        placeholder: "Jonas Khanwald",
      },
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@studio.com",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
        placeholder: "Create a secure password",
      },
    ],
    footerLink: (audience) => ({
      text: "Already have an account?",
      linkLabel: "Log in",
      href: `/${audience}/log-in`,
    }),
  },
  "log-in": {
    title: "Welcome back",
    description:
      "Pick up where you left off with saved briefs and vendor threads.",
    actionLabel: "Log in",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@momentev.com",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "current-password",
        placeholder: "Enter your password",
      },
    ],
    helperText: "Forgot your password? Reset it below.",
    footerLink: (audience) => ({
      text: "New to Momentev?",
      linkLabel: "Create an account",
      href: `/${audience}/sign-up`,
    }),
    secondaryLink: {
      label: "Reset password",
      href: (audience) => `/${audience}/password-reset`,
    },
  },
  "email-verification": {
    title: "Verify your email",
    description: "Enter the 6-digit code we just emailed to confirm ownership.",
    actionLabel: "Verify email",
    fields: [
      {
        name: "code",
        label: "Verification code",
        type: "text",
        autoComplete: "one-time-code",
        placeholder: "123456",
      },
    ],
    helperText:
      "Didn’t see the email yet? It may take up to a minute to arrive.",
    secondaryLink: {
      label: "Resend code",
      href: (audience) => `/${audience}/email-verification`,
    },
    footerLink: (audience) => ({
      text: "Already verified?",
      linkLabel: "Continue to login",
      href: `/${audience}/log-in`,
    }),
  },
  "verification-successful": {
    title: "You’re verified 🎉",
    description:
      "Your workspace is ready. You can now invite collaborators and connect services.",
    actionLabel: "Go to login",
    layout: "status",
    statusIcon: "success",
    actionHref: (audience) => `/${audience}/log-in`,
    footerLink: (audience) => ({
      text: "Need another workspace?",
      linkLabel: "Create a new account",
      href: `/${audience}/sign-up`,
    }),
  },
  "password-reset": {
    title: "Reset your password",
    description:
      "We’ll email a secure link so you can create a new password for your workspace.",
    actionLabel: "Send reset link",
    fields: [
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@company.com",
      },
    ],
    helperText:
      "You’ll receive a message within a few minutes. The link expires in 20 minutes.",
    footerLink: (audience) => ({
      text: "Remembered it?",
      linkLabel: "Back to login",
      href: `/${audience}/log-in`,
    }),
  },
};

export function AuthScreen({ audience, screen }: AuthScreenProps) {
  const info = audienceInfo[audience];
  const config = screenConfig[screen];
  const footnote = config.footerLink(audience);
  const secondaryHref = config.secondaryLink?.href(audience);
  const actionHref = config.actionHref?.(audience);
  const isStatus = config.layout === "status";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-slate-900 text-white shadow-2xl">
          <Image
            src={info.heroImage}
            alt={`${info.label} inspiration`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/80" />
          <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <span className="h-px w-6 bg-slate-200/60" />
                {info.badge}
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">
                {info.heroHeadline}
              </h1>
              <p className="mt-4 max-w-lg text-base text-slate-200">
                {info.heroCopy}
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <ul className="space-y-3 text-sm text-slate-100">
                {info.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-2 font-medium"
                  >
                    <span className="rounded-full bg-white/15 p-1 text-slate-900">
                      <Check className="size-4" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-4">
                {info.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <p className="text-xs uppercase tracking-wide text-white/80">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3">
              <Logo withWordmark className="text-base font-semibold" />
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {info.label} portal
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">
                  {config.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {config.description}
                </p>
                {config.highlight ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {config.highlight}
                  </p>
                ) : null}
              </div>
            </div>

            {isStatus ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                  <p className="mt-4 text-base font-medium text-slate-900">
                    Your identity is verified
                  </p>
                  <p className="text-sm text-slate-500">
                    Invite collaborators, sync your calendar, and start
                    responding to briefs.
                  </p>
                </div>
                {actionHref ? (
                  <Button asChild className="w-full text-base">
                    <Link href={actionHref}>
                      {config.actionLabel}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <form className="mt-8 space-y-6">
                <div className="space-y-5">
                  {config.fields?.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={`${audience}-${screen}-${field.name}`}>
                        {field.label}
                      </Label>
                      <Input
                        id={`${audience}-${screen}-${field.name}`}
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        required
                      />
                    </div>
                  ))}
                </div>
                {config.helperText ? (
                  <p className="text-sm text-slate-500">{config.helperText}</p>
                ) : null}
                <Button type="submit" className="w-full text-base">
                  {config.actionLabel}
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Continue with Google
                </Button>
              </form>
            )}

            {config.secondaryLink && secondaryHref ? (
              <div className="mt-4 text-center text-sm">
                <Link
                  href={secondaryHref}
                  className="text-slate-600 underline-offset-4 hover:underline"
                >
                  {config.secondaryLink.label}
                </Link>
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>{footnote.text}</span>
              <Link
                href={footnote.href}
                className="font-semibold text-slate-900 underline-offset-4 hover:underline"
              >
                {footnote.linkLabel}
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-slate-600" />
              SOC2-ready infrastructure. We only store the essentials to verify
              your workspace.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type AuthScreenProps = {
  audience: Audience;
  screen: AuthScreenType;
};
