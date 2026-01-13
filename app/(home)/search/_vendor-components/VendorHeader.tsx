import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VendorHeaderProps {
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export function VendorHeader({
  name,
  rating,
  reviewCount,
  tags,
}: VendorHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Vendor Info Row */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
          <Image
            src="/assets/svg/logo-icon.svg"
            alt="Vendor logo"
            fill
            className="object-contain"
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
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal text-primary bg-primary/10 hover:bg-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1 h-11">Book Vendor</Button>
        <Button
          variant="outline"
          className="flex-1 h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Message Vendor
        </Button>
      </div>
    </div>
  );
}
