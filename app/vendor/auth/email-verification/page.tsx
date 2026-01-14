import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import { EmailVerificationCard } from "../_components/EmailVerificationCard";
import { vendorHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VendorEmailVerificationPage({
  searchParams,
}: Props) {
  const { email } = await searchParams;

  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<EmailVerificationCard email={email} />}
    />
  );
}
