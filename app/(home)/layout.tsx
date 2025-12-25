import Footer from "./_components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// import Header from "./_components/Header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* <header/> */}
      <html lang="en" className={inter.variable}>
        <body className="font-inter">{children}</body>
      </html>
      <Footer />
    </div>
  );
}
