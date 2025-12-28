import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import { EmailVerificationCard } from "../_components/EmailVerificationCard";
import { vendorHeroCopy } from "../hero";

export default function VendorEmailVerificationPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<EmailVerificationCard />}
    />
  );
}
