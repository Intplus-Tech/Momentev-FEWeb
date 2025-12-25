
import React from "react";

import ContentWrapper from "./_components/Common/ContentWrapper";
import Hero from "./_components/Hero/Hero";
import BelowHero from "./_components/Hero/BelowHero";
import FeaturedVendors from "./_components/Featured/FeatureVendors";
import BookedServices from "./_components/Booked/BookServices";
import GrowBusiness from "./_components/GrowBusiness/GrowBusiness";
import StartEvent from "./_components/StartEvent/StartEvent";

const page = () => {
  return (
    <div className="h-screen">
      <ContentWrapper>
        <Hero/>
        <BelowHero/>
        <FeaturedVendors/>
        <BookedServices/>
        <GrowBusiness/>
        <StartEvent/>
      </ContentWrapper>

      
    </div>
  );
};

export default page;
