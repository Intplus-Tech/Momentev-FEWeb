"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user";
import { Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

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
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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
        setUserProfile(result.data);

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

        // Vendor is onboarded, check if active
        if (vendor.isActive === false) {
          setIsActive(false);
        } else {
          setIsActive(true);
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

  // If onboarded but not active, show under review screen
  if (isActive === false) {
    const businessName = userProfile?.vendor?.businessProfile?.businessName || userProfile?.firstName + "'s Business";
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-xl shadow-sm border border-border text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Account Under Review
            </h1>
            <p className="text-lg font-medium text-foreground">
              {businessName}
            </p>
            
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold text-sm border border-yellow-500/20 my-4 shadow-sm">
              Status: Pending Approval
            </div>
            
            <p className="text-muted-foreground pt-2">
              Your onboarding information has been submitted successfully and is currently under review by our team.
            </p>
            <p className="text-muted-foreground font-medium pt-2">
              Please check back in 24 hours if you have not received an email notification.
            </p>
          </div>
          
          <div className="pt-2 w-full">
            <form action={() => logout("/")} className="w-full">
              <Button type="submit" variant="outline" className="w-full flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Return to Home
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
