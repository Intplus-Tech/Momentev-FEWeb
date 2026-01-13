import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Vendor } from "../_data/vendors";

interface PromotedVendorCardProps {
  vendor: Vendor;
}

export function PromotedVendorCard({ vendor }: PromotedVendorCardProps) {
  return (
    <Link href={`/search/${vendor.slug}`} className="group">
      <div className="bg-background">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-transparent">
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            className="object-cover rounded-4xl"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 rounded-b-[20px]" />
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-foreground" />
            <span className="text-xs font-light">
              {vendor.rating} ({vendor.reviews.toLocaleString()})
            </span>
          </div>
        </div>
        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {vendor.name}
          </h3>
          <div className="flex items-start gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <p className="text-xs line-clamp-2">{vendor.address}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Promoted</p>
        </div>
      </div>
    </Link>
  );
}
