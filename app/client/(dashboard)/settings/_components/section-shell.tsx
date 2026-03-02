import React from "react";

import { cn } from "@/lib/utils";

export const SectionShell = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("rounded-md border bg-white", className)}>
    <div className="border-b bg-[#A0B0E6] rounded-t-md text-white px-4 py-3 text-sm font-medium">
      {title}
    </div>
    <div className="">{children}</div>
  </div>
);
