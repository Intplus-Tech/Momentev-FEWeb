import React from "react";

export const SectionShell = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-card">
    <div className="rounded-t-xl border-b bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground">
      {title}
    </div>
    <div className="space-y-4 p-4 sm:p-6">{children}</div>
  </div>
);
