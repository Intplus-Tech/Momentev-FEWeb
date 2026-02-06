"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/api/use-user-profile";

interface VendorHeaderProps {
  name: string;
  logo?: string | null;
  rating: number;
  reviewCount: number;
}

export function VendorHeader({
  name,
  logo,
  rating,
  reviewCount,
}: VendorHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useUserProfile();

  const role = user?.role?.toUpperCase();
  const isVendor = role === "VENDOR";
  const isClient = role === "CUSTOMER";
  const isLoggedOut = !user && (isError || !isLoading);
  const showActions = !isVendor;

  const redirectToLogin = () => {
    const redirect = pathname || "/client";
    router.push(`/client/auth/log-in?redirect=${encodeURIComponent(redirect)}`);
  };

  const handleBook = () => {
    if (isLoggedOut) {
      redirectToLogin();
      return;
    }

    if (isClient) {
      // TODO: implement booking flow for clients
      console.log("Book Vendor clicked (client flow pending)");
      return;
    }

    // Non-client (e.g., admin) fall back to login for now
    redirectToLogin();
  };

  const handleMessage = () => {
    if (isLoggedOut) {
      redirectToLogin();
      return;
    }

    if (isClient) {
      // TODO: implement messaging flow for clients
      console.log("Message Vendor clicked (client flow pending)");
      return;
    }

    redirectToLogin();
  };

  return (
    <div className="space-y-4">
      {/* Vendor Info Row */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden bg-muted">
          <Image
            src={logo || "/assets/svg/logo-icon.svg"}
            alt={`${name} logo`}
            fill
            className={logo ? "object-cover" : "object-contain"}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
              {rating}
            </span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviewCount.toLocaleString()} Reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3">
          <Button
            className="flex-1 h-11"
            onClick={handleBook}
            disabled={isLoading}
          >
            Book Vendor
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleMessage}
            disabled={isLoading}
          >
            Message Vendor
          </Button>
        </div>
      )}
    </div>
  );
}
