"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdown } from "../UserDropdown";
import type { UserProfile } from "@/types/auth";

import type { AuthIntent } from "./types";

type SimpleHeaderProps = {
  isScrolledSlightly: boolean;
  isUserLoading: boolean;
  user?: UserProfile;
  onOpenMobileMenu: () => void;
  onOpenAuthModal: (intent: AuthIntent) => void;
};

export function SimpleHeader({
  isScrolledSlightly,
  isUserLoading,
  user,
  onOpenMobileMenu,
  onOpenAuthModal,
}: SimpleHeaderProps) {
  const isClient = user?.role === "CUSTOMER" || user?.role === "customer";

  return (
    <nav
      className={`fixed top-4 2xl:max-w-7xl max-w-[80%] mx-auto rounded-full left-0 right-0 z-50 transition-colors duration-300 ${isScrolledSlightly
        ? "bg-black/45 backdrop-blur-md"
        : "bg-black/30 backdrop-blur-sm"
        }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between relative">
        <Logo variant="mixed" className="text-white shrink-0" />

        <div className="flex items-center gap-3 xl:gap-4">
          <div className="hidden lg:flex items-center">
            {isUserLoading ? (
              <Skeleton className="h-8 w-28 bg-white/20" />
            ) : (
              (!user || isClient) && (
                !user ? (
                  <Button
                    variant="link"
                    onClick={() => onOpenAuthModal("post-request")}
                  >
                    <span className="text-sm text-white/95 hover:text-white transition-colors duration-200">
                      Post A Request
                    </span>
                  </Button>
                ) : (
                  <Button asChild variant="link">
                    <Link
                      href="/client/custom-request"
                      className="text-sm text-white/95 hover:text-white transition-colors duration-200"
                    >
                      Post A Request
                    </Link>
                  </Button>
                )
              )
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 text-white">
            {isUserLoading ? (
              <>
                <Skeleton className="h-8 w-16 bg-white/20" />
                <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
              </>
            ) : user ? (
              <UserDropdown user={user} />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="transition-colors duration-200 bg-white/15 px-4"
                  onClick={() => onOpenAuthModal("sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  className="rounded-l-md rounded-r-4xl pr-4"
                  onClick={() => onOpenAuthModal("list-business")}
                >
                  List Your Business
                </Button>
              </>
            )}
          </div>
        </div>

        <button
          className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>
    </nav>
  );
}
