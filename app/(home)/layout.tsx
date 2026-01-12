"use client";

import { usePathname } from "next/navigation";
import Footer from "./_components/Footer";
import HomeHeader from "./_components/HomeHeader";

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
        {!isHome && <HomeHeader />}
        {children}
        <Footer />
      </div>
    </div>
  );
}
