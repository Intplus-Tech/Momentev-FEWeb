"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { handleGoogleCallback } from "@/lib/actions/auth";
import { Spinner } from "@/components/ui/spinner";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processCallback() {
      const code = searchParams.get("code");

      if (!code) {
        setError("No authorization code received from Google");
        setIsProcessing(false);
        return;
      }

      // Retrieve role from sessionStorage (set before redirecting to Google)
      const role = (
        typeof window !== "undefined"
          ? sessionStorage.getItem("google_auth_role")
          : null
      ) as "customer" | "vendor" | null;

      // Clean up sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("google_auth_role");
      }

      try {
        const result = await handleGoogleCallback(code, role || undefined);

        if (!result.success) {
          setError(result.error || "Failed to complete Google sign-in");
          setIsProcessing(false);
          return;
        }

        // Redirect based on user role
        const userRole = result.data?.user?.role;

        if (userRole === "vendor") {
          router.replace("/vendor/dashboard");
        } else {
          // Default to client dashboard for customer role or any other role
          router.replace("/client/dashboard");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setIsProcessing(false);
      }
    }

    processCallback();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-lg text-muted-foreground">
          Completing sign-in with Google...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Sign-in Failed
          </h2>
          <p className="mb-4 text-sm text-destructive/80">{error}</p>
          <Link
            href="/client/auth/log-in"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
