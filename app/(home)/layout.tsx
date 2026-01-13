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
      <div
        className={`font-inter min-h-screen overflow-hidden relative ${
          !isHome
            ? "bg-[url('/assets/bg-images/home-bg.svg')] bg-cover bg-center bg-fixed"
            : ""
        }`}
      >
        {/* Dark overlay for non-home pages */}
        {!isHome && (
          <div className="absolute inset-0 bg-gray-200/50 pointer-events-none" />
        )}
        <div className="relative z-10">
          {!isHome && <HomeHeader />}
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
