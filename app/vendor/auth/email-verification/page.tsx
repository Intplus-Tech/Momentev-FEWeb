import { AuthScreen } from "@/components/sections/auth/auth-screen";

import AuthFormCard from "../_components/AuthFormCard";
import { vendorHeroCopy } from "../hero";

export default function VendorEmailVerificationPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<AuthFormCard audience="vendor" screen="email-verification" />}
    />
  );
}
