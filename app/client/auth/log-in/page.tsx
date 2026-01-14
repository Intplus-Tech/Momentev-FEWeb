import { ClientLoginForm } from "../_components/LoginForm";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ClientLoginPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientLoginForm verificationToken={token} />}
    />
  );
}
