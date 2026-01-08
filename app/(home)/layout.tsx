"use client";

import { usePathname } from "next/navigation";
import AboutNav from "./_components/HomeHeader";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <div>
      <div className="font-inter min-h-screen overflow-hidden">
        {!isHome && <AboutNav />}
        {children}
      </div>
    </div>
  );
}
