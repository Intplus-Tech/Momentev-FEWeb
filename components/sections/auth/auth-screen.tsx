import Logo from "@/components/brand/logo";
import Link from "next/link";
import { ReactNode } from "react";

type AuthScreenProps = {
  mainText: string;
  subText: string;
  component: ReactNode;
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function AuthScreen({ mainText, subText, component }: AuthScreenProps) {
  return (
    <div className="relative min-h-screen bg-[url(/assets/images/sign-in-bg.png)] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />

      <header className="relative z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-sm opacity-90 hover:opacity-100 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex items-center min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-3 text-white">
              <h1 className="font-semibold text-4xl leading-snug">
                {mainText}
              </h1>
              <p className="text-base opacity-90">{subText}</p>
            </div>

            <div className="bg-white rounded-md p-6 shadow-lg">{component}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
