import Logo from "@/components/brand/logo";
import Link from "next/link";
import { ReactNode } from "react";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <div className="relative min-h-screen overflow-hidden bg-[url(/assets/images/sign-in-bg.png)] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="w-full">
          <div className="container mx-auto flex items-center justify-between px-4 py-6">
            <Logo />

            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-6 text-sm text-white opacity-90 xl:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Sheet>
                <SheetTrigger className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 p-2 text-primary shadow transition hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 xl:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </SheetTrigger>
                <SheetContent side="right" className="">
                  <SheetHeader className="border-b  px-4 py-6">
                    <SheetTitle className="text-lg font-semibold ">
                      Navigate Momentev
                    </SheetTitle>
                    <p className="text-sm">Explore key pages and learn more.</p>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 px-4 py-6 text-base">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-xl border px-4 py-3 text-left font-medium transition "
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center py-2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-2">
              <div className="hidden xl:flex flex-col gap-4 text-center text-white xl:text-left">
                <h1 className="text-3xl font-semibold leading-snug sm:text-[42px]">
                  {mainText}
                </h1>
                <p className="text-base text-white/90">{subText}</p>
              </div>

              <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl backdrop-blur-sm sm:p-6 xl:ml-auto xl:max-w-lg">
                <div>{component}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
