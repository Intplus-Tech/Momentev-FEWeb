import React from "react";

export const SectionShell = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md border bg-card">
    <div className="border-b bg-primary/40 rounded-t-md text-white px-4 py-3 text-sm font-medium">
      {title}
    </div>
    <div className="space-y-4 p-4 sm:p-6">{children}</div>
  </div>
);
