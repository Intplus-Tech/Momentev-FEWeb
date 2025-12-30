import { Star } from "lucide-react";

import type { SavedVendor } from "../data";
import { SectionShell } from "./section-shell";
import { Button } from "@/components/ui/button";

export const SavedVendorsSection = ({
  vendors,
}: {
  vendors: SavedVendor[];
}) => {
  return (
    <SectionShell title={`${vendors.length} Saved Vendors`}>
      <div className="space-y-3">
        {vendors.map((vendor, index) => (
          <div
            key={vendor.id}
            className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {vendor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vendor.category}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{vendor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({vendor.reviewCount} reviews)
                </span>
              </div>
              <Button variant={"link"}>View Profile</Button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};
