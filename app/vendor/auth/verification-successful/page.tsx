import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import { VerificationSuccessCard } from "../_components/VerificationSuccessCard";
import { vendorHeroCopy } from "../hero";

export default function VendorVerificationSuccessPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<VerificationSuccessCard />}
    />
  );
}
