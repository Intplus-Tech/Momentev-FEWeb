import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ConversationHeaderProps = {
  vendorName?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  lastActiveLabel?: string;
  leftSlot?: React.ReactNode;
  className?: string;
};

export const ConversationHeader = ({
  vendorName,
  avatar,
  rating,
  reviewCount,
  lastActiveLabel,
  leftSlot,
  className,
}: ConversationHeaderProps) => {
  const initials = vendorName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-5 py-4 shadow-sm",
        className,
      )}
    >
      {leftSlot ? (
        <div className="flex items-center gap-2">{leftSlot}</div>
      ) : null}

      {/* Left side: Avatar and Name */}
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {avatar ? (
            <AvatarImage src={avatar} alt={vendorName} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{vendorName}</p>
          {lastActiveLabel ? (
            <p className="text-xs text-muted-foreground">{lastActiveLabel}</p>
          ) : null}
        </div>
      </div>

      {/* Right side: Rating and Reviews */}
      {(rating !== undefined || reviewCount !== undefined) && (
        <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-current text-amber-400" />
          <span className="font-medium">{rating?.toFixed(1) ?? "0.0"}</span>
          <span className="text-muted-foreground/60">
            ({reviewCount ?? 0} Reviews)
          </span>
        </div>
      )}
    </div>
  );
};
