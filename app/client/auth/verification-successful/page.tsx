import { ClientVerificationSuccessCard } from "../_components/VerificationSuccessCard";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ClientVerificationSuccessPage({
  searchParams,
}: Props) {
  const { token } = await searchParams;

  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientVerificationSuccessCard token={token} />}
    />
  );
}
