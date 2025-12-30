import { ClientEmailVerificationCard } from "../_components/EmailVerificationCard";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

export default function ClientEmailVerificationPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientEmailVerificationCard />}
    />
  );
}
