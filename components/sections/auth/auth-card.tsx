import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Audience,
  AuthScreenType,
  audienceContent,
  screenConfig,
} from "./config";

type AuthCardProps = {
  audience: Audience;
  screen: AuthScreenType;
};

export function AuthCard({ audience, screen }: AuthCardProps) {
  const info = audienceContent[audience];
  const config = screenConfig[screen];
  const footnote = config.footerLink(audience);
  const secondaryHref = config.secondaryLink?.href(audience);
  const actionHref = config.actionHref?.(audience);
  const isStatus = config.layout === "status";

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <Logo />
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {info.label} portal
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">
            {config.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
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
              Invite collaborators, sync your calendar, and start responding to
              briefs.
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
        SOC2-ready infrastructure. We only store the essentials to verify your
        workspace.
      </div>
    </div>
  );
}

export { audienceContent } from "./config";
export type { Audience, AuthScreenType } from "./config";
