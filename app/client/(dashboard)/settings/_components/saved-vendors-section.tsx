import { Star, Loader2, Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";

import { SectionShell } from "./section-shell";
import { Button } from "@/components/ui/button";
import { useClientFavorites, useRemoveFavorite } from "@/hooks/api/use-client-favorites";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export const SavedVendorsSection = () => {
  const { data: favoritesData, isLoading } = useClientFavorites();
  const removeFavorite = useRemoveFavorite();

  const vendors = favoritesData?.data || [];
  const total = favoritesData?.total || 0;

  if (isLoading) {
    return (
      <SectionShell title="Saved Vendors">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={`${total} Saved Vendors`}>
      <div className="space-y-3 p-4 min-h-[45vh] flex flex-col justify-start">
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <Bookmark className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No saved vendors yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              You haven't saved any vendors to your favorites. Browse professionals and save them to find them quickly later.
            </p>
          </div>
        ) : (
          vendors.map((vendor: any) => {
            const vendorInfo = vendor.vendorId;
            const businessName = vendorInfo?.businessProfile?.businessName || "V";
            const fallbackInitials = businessName.substring(0, 2).toUpperCase();
            
            return (
              <div
                key={vendor._id}
                className="flex flex-col gap-3 rounded-xl border border-border/50 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center w-full"
              >
                <div className="flex flex-1 items-center gap-4">
                  <Avatar className="h-14 w-14 border object-cover">
                    {vendorInfo?.profilePhoto?.url ? (
                      <AvatarImage
                        src={vendorInfo.profilePhoto.url}
                        alt={`${vendorInfo?.businessProfile?.businessName || 'Vendor'}`}
                      />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                        {fallbackInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col flex-1 pl-2">
                    <p className="text-[15px] font-semibold text-foreground">
                      {vendorInfo?.businessProfile?.businessName || "Vendor"}
                    </p>
                    <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
                      {vendorInfo?.businessProfile?.businessDescription || "Professional Provider"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-1.5 text-sm text-yellow-500 font-medium">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{Number(vendorInfo?.rate || 0).toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">
                      ({vendorInfo?.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="link" className="text-primary font-medium hover:no-underline px-0 sm:px-4" asChild>
                      <Link href={`/search/${vendorInfo?._id || vendorInfo?.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      title="Remove from favorites"
                      disabled={removeFavorite.isPending}
                      onClick={async () => {
                        try {
                          await removeFavorite.mutateAsync(vendorInfo?._id || vendorInfo?.id);
                          toast.success("Vendor removed from favorites");
                        } catch (error) {
                          toast.error("Failed to remove vendor");
                        }
                      }}
                    >
                      {removeFavorite.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionShell>
  );
};
