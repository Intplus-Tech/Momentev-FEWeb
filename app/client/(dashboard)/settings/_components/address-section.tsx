"use client";

import { Loader2 } from "lucide-react";
import { useUserAddress } from "@/lib/react-query/hooks/use-user-address";
import { AddressForm } from "@/components/ui/address-form";
import { SectionShell } from "./section-shell";

export const AddressSection = () => {
  const { data: address, isLoading } = useUserAddress();

  return (
    <SectionShell title="Address">
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AddressForm address={address} />
      )}
    </SectionShell>
  );
};
