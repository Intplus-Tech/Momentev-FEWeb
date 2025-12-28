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
  actions?: React.ReactNode;
  className?: string;
};

export const ConversationHeader = ({
  vendorName,
  avatar,
  rating,
  reviewCount,
  lastActiveLabel,
  leftSlot,
  actions,
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
        className
      )}
    >
      {leftSlot ? (
        <div className="flex items-center gap-2">{leftSlot}</div>
      ) : null}

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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {rating ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </span>
            ) : null}
            {reviewCount !== undefined ? (
              <span className="text-[11px]">{reviewCount} reviews</span>
            ) : null}
            {lastActiveLabel ? <span className="text-[11px]">|</span> : null}
            {lastActiveLabel ? (
              <span className="text-[11px]">{lastActiveLabel}</span>
            ) : null}
          </div>
        </div>
      </div>

      {actions ? (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};
