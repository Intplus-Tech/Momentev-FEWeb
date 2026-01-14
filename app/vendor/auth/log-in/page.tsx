import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import { LoginForm } from "../_components/LoginForm";
import { vendorHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VendorLoginPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<LoginForm verificationToken={token} />}
    />
  );
}
