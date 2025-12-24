import { AuthScreen } from "@/components/sections/auth/auth-screen";
import SignUpForm from "../_components/SignUpForm";

export const hero = {
  mainText:
    "Design Unforgettable Events that resonate deeply with your audience.",
  subText: "Apply, Get Verified, - Earn All on  Momentev",
};

export default function VendorPasswordResetPage() {
  return (
    <AuthScreen
      mainText={hero.mainText}
      subText={hero.subText}
      component={<SignUpForm />}
    />
  );
}
