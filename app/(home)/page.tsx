import React from "react";

import ContentWrapper from "./_components/Common/ContentWrapper";
import Hero from "./_components/Hero/Hero";
import BelowHero from "./_components/Hero/BelowHero";
import FeaturedVendors from "./_components/Featured/FeatureVendors";
import BookedServices from "./_components/Booked/BookServices";
import GrowBusiness from "./_components/GrowBusiness/GrowBusiness";
import StartEvent from "./_components/StartEvent/StartEvent";
import PeopleFeel from "./_components/PeopleFeel/PeopleFeel";
import NewMomentev from "./_components/NewMomentev/NewMomentev";
import BrowseCategory from "./_components/BrowseCategory/BrowseCategory";
import Footer from "./_components/Footer";

const page = () => {
  return (
    <div>
      <Hero />
      <BelowHero />
      <FeaturedVendors />
      <BookedServices />
      <GrowBusiness />
      <StartEvent />
      <PeopleFeel />
      <NewMomentev />
      <BrowseCategory />
      <Footer />
    </div>
  );
};

export default page;
