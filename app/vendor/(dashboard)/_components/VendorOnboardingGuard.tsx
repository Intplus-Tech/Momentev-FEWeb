"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user";
import { Loader2 } from "lucide-react";

interface VendorOnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component for vendor dashboard
 * Redirects vendors who haven't completed onboarding to the setup wizard
 */
export function VendorOnboardingGuard({
  children,
}: VendorOnboardingGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const result = await getUserProfile();

        if (!result.success || !result.data) {
          // Not authenticated - redirect to login

          router.replace("/vendor/auth/login");
          return;
        }

        const { vendor } = result.data;

        // Check if user is a vendor
        if (!vendor) {
          router.replace("/");
          return;
        }

        // Check onboarding status
        if (!vendor.onBoarded) {
          // Determine which step to redirect to based on onBoardingStage
          const stageRoutes: Record<number, string> = {
            0: "/vendor/business-setup",
            1: "/vendor/business-setup",
            2: "/vendor/service-setup",
            3: "/vendor/payment-setup",
            4: "/vendor/profile-setup",
          };

          const redirectRoute =
            stageRoutes[vendor.onBoardingStage] || "/vendor/business-setup";
          router.replace(redirectRoute);
          return;
        }

        // Vendor is onboarded, allow access

        setIsOnboarded(true);
      } catch (error) {
        console.error(
          "❌ [VendorGuard] Error checking onboarding status:",
          error,
        );
        router.replace("/vendor/auth/login");
      } finally {
        setIsChecking(false);
      }
    }

    checkOnboardingStatus();
  }, [router]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not onboarded (will redirect)
  if (!isOnboarded) {
    return null;
  }

  return <>{children}</>;
}
