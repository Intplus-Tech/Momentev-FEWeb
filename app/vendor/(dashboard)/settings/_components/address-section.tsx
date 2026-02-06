"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserAddress } from "@/hooks/api/use-user-address";
import { AddressForm } from "@/app/vendor/(dashboard)/settings/_components/address-form";
import { SectionShell } from "./section-shell";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/lib/actions/user";
import { queryKeys } from "@/lib/react-query/keys";

export const AddressSection = () => {
  const router = useRouter();
  const { data, isLoading } = useUserAddress();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const address = data?.address;
  const isBusinessFallback = data?.source === "business";

  const handleSync = async () => {
    if (!address?._id) return;

    setIsSyncing(true);
    try {
      const result = await updateUserProfile({ addressId: address._id });
      if (result.success) {
        toast.success("Address synced to profile");
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.user(),
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sync address");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SectionShell title="Address">
      {isLoading ? (
        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isBusinessFallback && address ? (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Business Address Available</p>
              <p className="text-xs text-muted-foreground">
                You have an address linked to your business profile. Please sync
                to use this address.
              </p>
            </div>
          </div>
          <div className="text-sm">
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </div>
          <Button onClick={handleSync} size="sm" disabled={isSyncing}>
            {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Address to Profile
          </Button>
        </div>
      ) : (
        <AddressForm address={address} />
      )}
    </SectionShell>
  );
};
