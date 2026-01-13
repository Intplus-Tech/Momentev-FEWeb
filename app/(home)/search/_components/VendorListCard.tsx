import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vendor } from "../_data/vendors";

interface VendorListCardProps {
  vendor: Vendor;
}

export function VendorListCard({ vendor }: VendorListCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-72 lg:w-80 shrink-0">
          <div className="aspect-[4/3] md:aspect-auto md:h-full relative bg-transparent not-even:">
            <Image
              src={vendor.image}
              alt={vendor.name}
              fill
              className="object-cover rounded-[20px]"
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 rounded-b-[20px]" />
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">
                {vendor.rating} ({vendor.reviews})
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Vendor Info */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg md:text-xl font-semibold">{vendor.name}</h3>
            <div className="flex items-start gap-1.5 text-primary">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{vendor.address}</p>
            </div>
            {vendor.distance && (
              <p className="text-sm text-muted-foreground">{vendor.distance}</p>
            )}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{vendor.rating} Stars</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span
                className={`font-medium ${
                  vendor.isOpen ? "text-green-600" : "text-red-500"
                }`}
              >
                {vendor.isOpen ? "Open" : "Closed"}
              </span>
              {vendor.closingTime && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Closes {vendor.closingTime}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {vendor.reviews} Reviews
              </span>
              {vendor.bookings && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {vendor.bookings} Bookings
                  </span>
                </>
              )}
            </div>
            <Link
              href={`/search/${vendor.slug}`}
              className="text-primary text-sm font-medium hover:underline inline-block"
            >
              View Vendor Details
            </Link>
          </div>

          {/* Services */}
          {vendor.services && vendor.services.length > 0 && (
            <div className="hidden lg:block min-w-[200px]">
              <p className="font-medium text-sm mb-2">Services</p>
              <ul className="space-y-1">
                {vendor.services.map((service, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Book Button */}
          <div className="flex md:flex-col md:items-end md:justify-center">
            <Button className="w-full md:w-auto">Book Service</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
