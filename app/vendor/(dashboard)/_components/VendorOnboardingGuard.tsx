"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user";
import { Loader2 } from "lucide-react";
import { getEffectiveOnboardedStatus } from "@/lib/vendor-cache";

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
  const pathname = usePathname();
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

        const userRole = result.data.role?.toUpperCase();

        // VendorStaff bypass — they don't have their own vendor profile and
        // should never be sent through the vendor onboarding wizard.
        if (userRole === "VENDORSTAFF") {
          setIsOnboarded(true);
          return;
        }

        const { vendor } = result.data;

        console.log("[VendorGuard] User profile:", {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          hasVendor: !!vendor,
          vendorId: vendor?.id,
          onBoarded: vendor?.onBoarded,
          onBoardingStage: vendor?.onBoardingStage,
          isActive: vendor?.isActive,
          businessName: vendor?.businessProfile?.businessName,
        });

        // Check if user is a vendor
        if (!vendor) {
          router.replace("/");
          return;
        }

        // Check onboarding status - use cache if available to prevent looping
        const effectiveOnBoarded = getEffectiveOnboardedStatus(
          vendor.onBoarded,
          vendor._id || vendor.id,
        );
        if (!effectiveOnBoarded) {
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
  }, [router, pathname]);

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
