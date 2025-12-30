import { ClientLoginForm } from "../_components/LoginForm";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

export default function ClientLoginPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientLoginForm />}
    />
  );
}
