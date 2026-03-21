import { Suspense } from "react";
import { ClientAuthScreen } from "../_components/auth-screen";
import { ClientNewPasswordForm } from "../_components/NewPasswordForm";
import { clientHeroCopy } from "../hero";

export default function ClientNewPasswordPage() {
  return (
    <ClientAuthScreen
      mainText={clientHeroCopy.mainText}
      subText={clientHeroCopy.subText}
      component={
        <Suspense>
          <ClientNewPasswordForm />
        </Suspense>
      }
    />
  );
}
