"use client";

import Link from "next/link";
import { CheckCircle2, PartyPopper } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

type VerificationSuccessCardProps = {
  redirectPath?: string;
};

export function VerificationSuccessCard({
  redirectPath = "/vendor/auth/log-in",
}: VerificationSuccessCardProps) {
  return (
    <div className="space-y-6 text-center">
      <Logo className="mx-auto" />

      <div className="space-y-3">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <CheckCircle2 className="h-10 w-10" />
          <PartyPopper className="absolute -bottom-2 -right-1 h-5 w-5 text-rose-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Verification Successful
        </h2>
        <p className="text-sm text-slate-500">
          You will be automatically directed in 5 secs.
        </p>
      </div>

      <Button asChild className="w-full">
        <Link href={redirectPath}>Go to login</Link>
      </Button>

      <Link
        href={redirectPath}
        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
      >
        Skip
      </Link>
    </div>
  );
}
