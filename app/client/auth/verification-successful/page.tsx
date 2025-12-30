import { ClientVerificationSuccessCard } from "../_components/VerificationSuccessCard";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

export default function ClientVerificationSuccessPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientVerificationSuccessCard />}
    />
  );
}
