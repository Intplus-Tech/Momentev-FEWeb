"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, PartyPopper, Loader2, XCircle } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/actions/auth/auth";

type VerificationSuccessCardProps = {
  token?: string;
  redirectPath?: string;
};

export function ClientVerificationSuccessCard({
  token,
  redirectPath = "/client/auth/log-in",
}: VerificationSuccessCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Handle verification on mount
  useEffect(() => {
    async function handleVerification() {
      if (!token) {
        setStatus("error");
        setError("No verification token provided.");
        return;
      }

      try {
        const result = await verifyEmail(token);

        if (!result.success) {
          setStatus("error");
          setError(result.error || "Unable to verify email.");
          return;
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        const message =
          err instanceof Error ? err.message : "Unable to verify email.";
        setError(message);
      }
    }

    handleVerification();
  }, [token]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router, redirectPath]);

  return (
    <div className="mx-auto w-full max-w-xl pb-6 text-center">
      <div className="mt-4 space-y-6 p-4">
        {status === "loading" && (
          <div className="space-y-3">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-xl">Verifying your email...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="space-y-3">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
                <PartyPopper className="absolute -bottom-2 -right-1 h-5 w-5 text-rose-400" />
              </div>
              <h2 className="text-xl">Verification Successful!</h2>
              <p className="text-sm text-muted-foreground">
                You will be redirected in {countdown} seconds.
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href={redirectPath}>Go to sign in</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="space-y-3">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl">Verification Failed</h2>
              <p className="text-sm text-muted-foreground">
                {error || "Unable to verify your email address."}
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href={redirectPath}>Go to sign in</Link>
            </Button>

            <Link
              href="/client/auth/sign-up"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Try signing up again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
