"use client";

import AboutNav from "../_components/HomeHeader";
import ContentWrapper from "../_components/Common/ContentWrapper";
import FaqHero from "../_components/FaqHero";
import Footer from "../_components/Footer";

export default function FaqsPage() {
  return (
    <ContentWrapper>
      {/* Fixed AboutNav */}
      <div className="fixed top-0 left-0 w-full z-50">
        <AboutNav />
      </div>

      {/* Main content with padding to push it below the nav */}
      <main className="pt-[100px] md:pt-[120px]">
        <FaqHero />
        <Footer />
      </main>
    </ContentWrapper>
  );
}
