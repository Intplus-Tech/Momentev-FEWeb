import Hero from "./_components/Hero/Hero";
import BelowHero from "./_components/Hero/BelowHero";
import FeaturedVendors from "./_components/Featured/FeatureVendors";
import PostVendorCtaSection from "./_components/PostVendorCtaSection";
import BrowseCategory from "./_components/BrowseCategory/BrowseCategory";
import { getFeaturedVendorsAction } from "@/lib/actions/featured-vendors";
import PeopleFeel from "./_components/PeopleFeel/PeopleFeel";

const page = async () => {
  const featuredVendors = await getFeaturedVendorsAction(10);

  return (
    <div>
      <Hero />
      <BelowHero />
      <FeaturedVendors vendors={featuredVendors} />
      <PostVendorCtaSection />
      {/* <BookedServices /> */}
      {/* <GrowBusiness /> */}
      {/* <StartEvent /> */}
      {/* <NewMomentev /> */}
      <BrowseCategory />
      <PeopleFeel />
    </div>
  );
};

export default page;
