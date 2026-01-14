"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, RotateCcw, ExternalLink } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { resendVerificationEmail } from "@/lib/actions/auth/auth";

type EmailVerificationCardProps = {
  email?: string;
};

export function EmailVerificationCard({ email }: EmailVerificationCardProps) {
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;

    setResendStatus("loading");
    setError(null);
    try {
      const result = await resendVerificationEmail({ email });
      if (!result.success) {
        setError(result.error || "Unable to resend verification email.");
        setResendStatus("error");
        return;
      }
      setResendStatus("sent");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to resend verification email.";
      setError(message);
      setResendStatus("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-6 text-center">
      <div className="w-full flex items-center justify-center">
        <Logo className="hidden xl:block" />
      </div>

      <div className="mt-4 space-y-6 p-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Verification email has been sent to{" "}
            {email ? (
              <span className="font-semibold text-slate-900">{email}</span>
            ) : (
              "your email address"
            )}
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {resendStatus === "sent" && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Verification email sent! Check your inbox.
          </p>
        )}

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={resendStatus === "loading" || !email}
            onClick={handleResend}
          >
            {resendStatus === "loading" ? (
              <>
                <Spinner className="h-4 w-4" /> Sending...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" /> Resend email
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-500">
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
