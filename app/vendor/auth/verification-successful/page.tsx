import { AuthScreen } from "@/app/vendor/auth/_components/auth-screen";

import { VerificationSuccessCard } from "../_components/VerificationSuccessCard";
import { vendorHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VendorVerificationSuccessPage({
  searchParams,
}: Props) {
  const { token } = await searchParams;

  return (
    <AuthScreen
      mainText={vendorHeroCopy.mainText}
      subText={vendorHeroCopy.subText}
      component={<VerificationSuccessCard token={token} />}
    />
  );
}
