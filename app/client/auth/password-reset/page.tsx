import { ClientPasswordResetForm } from "../_components/PasswordResetForm";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

export default function ClientPasswordResetPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientPasswordResetForm />}
    />
  );
}
