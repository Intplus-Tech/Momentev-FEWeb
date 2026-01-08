import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentev • Experience design platform",
  description:
    "Momentev brings clients and vendors together with dedicated onboarding flows, verification, and landing experiences in one workspace.",
  metadataBase: new URL("https://momentev.local"),
  openGraph: {
    title: "Momentev",
    description:
      "Design unforgettable events and manage vendors with dedicated experiences for every persona.",
    url: "https://momentev.local",
    siteName: "Momentev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentev",
    description:
      "Design unforgettable events that resonate with your audience and keep every vendor in sync.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
