import { Suspense } from "react";
import { AuthScreen } from "../_components/auth-screen";
import { VendorNewPasswordForm } from "../_components/NewPasswordForm";
import { vendorHeroCopy } from "../hero";

export default function VendorNewPasswordPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={
        <Suspense>
          <VendorNewPasswordForm />
        </Suspense>
      }
    />
  );
}
