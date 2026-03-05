import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vendor } from "../_data/types";
import { VendorServices } from "./VendorServices";

interface VendorListCardProps {
  vendor: Vendor;
}

export function VendorListCard({ vendor }: VendorListCardProps) {
  // Derive display values from new API shape
  const name =
    vendor.name ?? vendor.businessProfile?.businessName ?? "Unknown Vendor";

  const address = (() => {
    if (vendor.address) return vendor.address;
    const addr = vendor.businessProfile?.contactInfo?.addressId;
    if (!addr) {
      // Fall back to service area
      const area = vendor.businessProfile?.serviceArea?.areaNames?.[0];
      if (area) return [area.city, area.state].filter(Boolean).join(", ");
      return "Location unavailable";
    }
    return [addr.city, addr.state].filter(Boolean).join(", ");
  })();

  const coverImage =
    vendor.coverImage ??
    (typeof vendor.coverPhoto === "object" && vendor.coverPhoto?.url
      ? vendor.coverPhoto.url
      : null) ??
    "/images/placeholder.jpg";

  const rating = vendor.rate ?? 0;
  const totalReviews = vendor.totalReviews ?? vendor.reviewCount ?? 0;

  // Workdays summary — join first 3 day names
  const workdaysSummary = (() => {
    if (vendor.workdays && typeof vendor.workdays === "string")
      return vendor.workdays;
    const days = vendor.businessProfile?.workdays;
    if (!days || days.length === 0) return null;
    const names = days.map((d) => d.dayOfWeek.charAt(0).toUpperCase() + d.dayOfWeek.slice(1, 3));
    return names.join(", ");
  })();

  const slug = vendor.slug ?? vendor.id ?? vendor._id;

  return (
    <div className="rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-72 lg:w-80 shrink-0">
          <div className="aspect-4/3 md:aspect-auto md:h-full relative bg-transparent">
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover rounded-[20px]"
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10 rounded-b-[20px]" />
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">
                {rating} ({totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Vendor Info */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg md:text-xl font-semibold">{name}</h3>
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{address}</p>
            </div>
            {vendor.distanceKm !== undefined && (
              <p className="text-sm text-muted-foreground">
                {vendor.distanceKm.toFixed(1)} km away
              </p>
            )}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating} Stars</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground mr-auto">
                {totalReviews} Reviews
              </span>
            </div>

            {/* Availability / Workdays */}
            {workdaysSummary && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                {workdaysSummary}
              </div>
            )}

            <Link
              href={`/search/${slug}`}
              className="text-primary text-sm font-medium hover:underline inline-block"
            >
              View Vendor Details
            </Link>
          </div>

          {/* Services — now fed directly from embedded API data */}
          <VendorServices
            vendorServices={vendor.vendorServices}
            vendorSpecialties={vendor.vendorSpecialties}
          />

          {/* Book Button */}
          <div className="flex md:flex-col md:items-end md:justify-center">
            <Button className="w-full md:w-auto">Book Service</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
