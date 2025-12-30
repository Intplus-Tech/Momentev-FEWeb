"use client";

import Link from "next/link";
import { CheckCircle2, PartyPopper } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

type VerificationSuccessCardProps = {
  redirectPath?: string;
};

export function ClientVerificationSuccessCard({
  redirectPath = "/client/auth/log-in",
}: VerificationSuccessCardProps) {
  return (
    <div className="mx-auto w-full max-w-xl pb-6 text-center">
      <Logo className="hidden xl:block" />

      <div className="mt-4 space-y-6 p-4">
        <div className="space-y-3">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <CheckCircle2 className="h-10 w-10" />
            <PartyPopper className="absolute -bottom-2 -right-1 h-5 w-5 text-rose-400" />
          </div>
          <h2 className="text-xl">Verification Successful</h2>
          <p className="text-sm text-muted-foreground">
            You will be redirected in 5 seconds.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href={redirectPath}>Go to sign in</Link>
        </Button>

        <Link
          href={redirectPath}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Skip
        </Link>
      </div>
    </div>
  );
}
