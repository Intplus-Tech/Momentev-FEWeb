import { AuthScreen } from "@/components/sections/auth/auth-screen";

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
