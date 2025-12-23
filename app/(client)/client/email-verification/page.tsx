import { AuthScreen } from "@/components/sections/auth/auth-screen";

export default function ClientEmailVerificationPage() {
  return <AuthScreen audience="client" screen="email-verification" />;
}
