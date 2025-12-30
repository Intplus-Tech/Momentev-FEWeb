import { ClientSignUpForm } from "../_components/SignUpForm";
import { ClientAuthScreen } from "../_components/auth-screen";
import { clientHeroCopy } from "../hero";

export default function ClientSignUpPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={<ClientSignUpForm />}
    />
  );
}
