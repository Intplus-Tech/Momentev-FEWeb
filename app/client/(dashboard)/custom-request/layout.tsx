import { ReactNode } from "react";

export default function CustomRequestLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
