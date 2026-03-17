"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Star, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useStartVendorConversation } from "@/hooks/api/use-chat";
import { useFavoriteStatus, useAddFavorite, useRemoveFavorite } from "@/hooks/api/use-client-favorites";
import { toast } from "sonner";

interface VendorHeaderProps {
  name: string;
  logo?: string | null;
  rating: number;
  reviewCount: number;
  vendorId: string;
  onBookVendor?: () => void;
}

export function VendorHeader({
  name,
  logo,
  rating,
  reviewCount,
  vendorId,
  onBookVendor,
}: VendorHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading: isUserLoading, isError } = useUserProfile();
  const startConversation = useStartVendorConversation();
  const { data: isFavorited, isLoading: isFavoriteLoading } = useFavoriteStatus(
    user?.role === "customer" || user?.role === "CUSTOMER" ? vendorId : undefined
  );
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const role = user?.role?.toUpperCase();
  const isVendor = role === "VENDOR";
  const isClient = role === "CUSTOMER";
  const isLoggedOut = !user && (isError || !isUserLoading);
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
      if (onBookVendor) {
        onBookVendor();
        return;
      }

      console.log("Book Vendor clicked (client flow pending)");
      return;
    }

    // Non-client (e.g., admin) fall back to login for now
    redirectToLogin();
  };

  const handleMessage = async () => {
    if (isLoggedOut) {
      redirectToLogin();
      return;
    }

    if (isClient) {
      if (!vendorId) {
        toast.error("Missing vendor info. Please try again.");
        return;
      }

      try {
        const conversation = await startConversation.mutateAsync(vendorId);
        if (conversation?._id) {
          router.push(`/client/messages/${conversation._id}`);
          return;
        }
        toast.error("Unable to open chat. Please try again.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to start conversation";
        toast.error(message);
      }
      return;
    }

    redirectToLogin();
  };

  const handleFavoriteToggle = async () => {
    if (isLoggedOut) {
      redirectToLogin();
      return;
    }

    if (!isClient) return;

    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync(vendorId);
        toast.success("Vendor removed from favorites");
      } else {
        await addFavorite.mutateAsync(vendorId);
        toast.success("Vendor added to favorites");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update favorites"
      );
    }
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
        <div id="book-vendor" className="flex gap-3">
          <Button
            className="flex-1 h-11"
            onClick={handleBook}
            disabled={isUserLoading}
          >
            Book Vendor
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleMessage}
            disabled={isUserLoading || startConversation.isPending}
          >
            Message Vendor
          </Button>
          {isClient && (
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-11 w-11 shrink-0 transition-all duration-200",
                isFavorited
                  ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleFavoriteToggle}
              disabled={isFavoriteLoading || addFavorite.isPending || removeFavorite.isPending}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavoriteLoading || addFavorite.isPending || removeFavorite.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isFavorited ? "fill-current scale-110" : "scale-100"
                  )}
                />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
