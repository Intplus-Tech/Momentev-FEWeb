import { ReactNode } from "react";

import { getUserProfile } from "@/lib/actions/user";

import Header from "./header";
import Sidebar from "./sidebar";
import SetupTitle from "./SetupTitle";

type VendorSetupLayoutShellProps = {
  children: ReactNode;
};

export default async function VendorSetupLayoutShell({
  children,
}: VendorSetupLayoutShellProps) {
  const profileResult = await getUserProfile();

  if (profileResult.success && profileResult.data) {
    const userInfo = {
      id: profileResult.data._id,
      firstName: profileResult.data.firstName,
      lastName: profileResult.data.lastName,
      email: profileResult.data.email,
      role: profileResult.data.role,
      status: profileResult.data.status,
      emailVerified: profileResult.data.emailVerified,
      phoneNumber: profileResult.data.phoneNumber,
    };

    const vendorInfo = profileResult.data.vendor
      ? {
        vendorId: profileResult.data.vendor._id,
        isActive: profileResult.data.vendor.isActive,
        onBoardingStage: profileResult.data.vendor.onBoardingStage,
        onBoarded: profileResult.data.vendor.onBoarded,
        businessProfile: profileResult.data.vendor.businessProfile ?? null,
      }
      : null;

    console.log("[Vendor Setup Layout] User info:", userInfo);
    console.log("[Vendor Setup Layout] Vendor/business info:", vendorInfo);
  } else {
    console.log(
      "[Vendor Setup Layout] Failed to load user profile:",
      profileResult.error
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 pt-16 lg:pl-64 relative">
          <SetupTitle />
          <div className="mx-auto w-full max-w-5xl px-4 py-6 mt-10 md:px-6 md:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}