import { AuthScreen } from "@/components/sections/auth/auth-screen";

export default function ClientVerificationSuccessPage() {
  return <AuthScreen audience="client" screen="verification-successful" />;
}
