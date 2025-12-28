import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { EarningsBreakdownItem } from "../data";

interface NetEarningsCardProps {
  items: EarningsBreakdownItem[];
}

const valueToneClasses: Record<EarningsBreakdownItem["tone"], string> = {
  positive: "text-[#2F6BFF]",
  negative: "text-[#D92D20]",
  neutral: "text-foreground",
};

export function NetEarningsCard({ items }: NetEarningsCardProps) {
  const headline = items.find((item) => item.highlight)?.value ?? "£0";
  return (
    <div className="rounded-3xl border bg-white p-2">
      <div className="">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm border-b p-4 last:border-0"
          >
            <span
              className={cn(
                item.highlight
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
            <span className={cn("font-semibold", valueToneClasses[item.tone])}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
