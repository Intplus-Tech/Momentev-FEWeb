"use client";

import Link from "next/link";
import { MailCheck, RotateCcw } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

type EmailVerificationCardProps = {
  email?: string;
};

export function EmailVerificationCard({
  email = "studio@momentev.com",
}: EmailVerificationCardProps) {
  return (
    <div className="space-y-6 text-center">
      <Logo className="mx-auto" />

      <div className="space-y-3">
        <MailCheck className="mx-auto h-14 w-14 text-indigo-500" />
        <h2 className="text-2xl font-semibold text-slate-900">
          Email Verification
        </h2>
        <p className="text-sm text-slate-500">
          Verification email has been sent to{" "}
          <span className="font-semibold text-slate-900">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <Button className="w-full">Open email app</Button>
        <Button type="button" variant="outline" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" /> Resend email
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        Want to use another inbox?{" "}
        <Link
          href="/vendor/auth/sign-up"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Send to another email instead
        </Link>
      </p>
    </div>
  );
}
