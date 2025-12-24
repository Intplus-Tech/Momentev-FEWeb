import { AuthScreen } from "@/components/sections/auth/auth-screen";

import { PasswordResetForm } from "../_components/PasswordResetForm";
import { vendorHeroCopy } from "../hero";

export default function VendorPasswordResetPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<PasswordResetForm />}
    />
  );
}
