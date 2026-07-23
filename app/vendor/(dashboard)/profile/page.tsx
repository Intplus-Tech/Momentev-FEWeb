"use client";

import { ProfileSection } from "../settings/_components/profile-section";
import { BusinessInfoSection } from "../settings/_components/business-info-section";
import { ContactInfoSection } from "../settings/_components/contact-info-section";
import { useUserProfile } from "@/hooks/api/use-user-profile";

export default function VendorProfilePage() {
  const { data: user } = useUserProfile();
  const businessProfile = user?.vendor?.businessProfile;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, business, and contact details.
        </p>
      </div>

      <div className="space-y-4">
        <ProfileSection />
        <BusinessInfoSection businessProfile={businessProfile} />
        <ContactInfoSection businessProfile={businessProfile} />
      </div>
    </section>
  );
}
