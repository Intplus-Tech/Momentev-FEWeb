import { AuthScreen } from "@/components/sections/auth/auth-screen";

import { LoginForm } from "../_components/LoginForm";
import { vendorHeroCopy } from "../hero";

export default function VendorLoginPage() {
  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<LoginForm />}
    />
  );
}
