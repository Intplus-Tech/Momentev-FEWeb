import { ClientEmailVerificationCard } from "../_components/EmailVerificationCard";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ClientEmailVerificationPage({
  searchParams,
}: Props) {
  const { email } = await searchParams;

  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientEmailVerificationCard email={email} />}
    />
  );
}
