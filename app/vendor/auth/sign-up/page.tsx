import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import SignUpForm from "../_components/SignUpForm";
import { vendorHeroCopy } from "../hero";

export default function VendorSignUpPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<SignUpForm />}
    />
  );
}
