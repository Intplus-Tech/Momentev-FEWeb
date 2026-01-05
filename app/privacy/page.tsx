"use client";


import AboutNav from "../(home)/_components/AboutNav";
import ContentWrapper from "../(home)/_components/Common/ContentWrapper";

import Footer from "../(home)/_components/Footer";
import PrivacyHero from "../(home)/_components/PrivacyHero";




export default function privacyPage() {
  return (
    <ContentWrapper>
      {/* Fixed AboutNav */}
      <div className="fixed top-0 left-0 w-full z-50">
       <AboutNav/>
      </div>

      {/* Main content with padding to push it below the nav */}
      <main className="pt-[100px] md:pt-[120px]">
       <PrivacyHero/>
       <Footer/>
      </main>
    </ContentWrapper>
  );
}
