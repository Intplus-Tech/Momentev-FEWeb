"use client";

import { useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileSidebar from "./mobile-sidebar";
import { usePathname } from "next/navigation";
import LogoSmall from "@/components/brand/LogoSmall";
import Logo from "@/components/brand/logo";
import { useAuthLogout } from "@/hooks/use-auth-logout";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Header() {
  const pathname = usePathname();
  const authLogout = useAuthLogout();
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const currentStep = useMemo(() => {
    if (pathname?.includes("/business-setup")) return 1;
    if (pathname?.includes("/service-setup")) return 2;
    if (pathname?.includes("/payment-setup")) return 3;
    if (pathname?.includes("/profile-setup")) return 4;
    if (pathname?.includes("/setup-review")) return 5;
    return 1;
  }, [pathname]);

  const isStepComplete = (step: number) => {
    if (step === 1) {
      return (
        completedSections.has("step1-section1") &&
        completedSections.has("step1-section2")
      );
    }

    if (step === 2) {
      return (
        completedSections.has("step2-section1") &&
        completedSections.has("step2-section2")
      );
    }

    if (step === 3) {
      return (
        completedSections.has("step3-section1") &&
        completedSections.has("step3-section2") &&
        completedSections.has("step3-section3")
      );
    }

    if (step === 4) {
      return (
        completedSections.has("step4-section1") &&
        completedSections.has("step4-section2")
      );
    }

    return true;
  };

  const hasIncompleteStep = currentStep < 5 ? !isStepComplete(currentStep) : false;

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await authLogout("/vendor/auth/log-in");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-muted z-40">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <Logo className="hidden xl:block" />

        {/* Mobile Menu */}
        <MobileSidebar />

        <Button
          variant="ghost"
          onClick={() => setShowLogoutConfirm(true)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Exit</span>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out and continue later?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasIncompleteStep
                ? "You haven't finished this step yet. If you log out now, your unfinished changes won't be saved, but anything you've already completed will still be there when you come back."
                : "You can safely log out now. When you sign back in, you'll return to your saved progress."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep working</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
