import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

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
