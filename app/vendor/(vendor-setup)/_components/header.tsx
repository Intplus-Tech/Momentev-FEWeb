"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileSidebar from "./mobile-sidebar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LogoSmall from "@/components/brand/LogoSmall";
import Logo from "@/components/brand/logo";

export default function Header() {
  const router = useRouter();

  const continueLater = () => {
    toast.success("Draft saved successfully");
    router.push("/vendor/dashboard");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-muted z-40">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <Logo className="hidden xl:block" />

        {/* Mobile Menu */}
        <MobileSidebar />

        {/* Continue Later Button */}
        {/* <Button
          variant="ghost"
          onClick={continueLater}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <span className="hidden sm:inline">Continue Later</span>
          <span className="sm:hidden">Exit</span>
          <LogOut className="h-4 w-4" />
        </Button> */}
      </div>
    </header>
  );
}
