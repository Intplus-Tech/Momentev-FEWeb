"use client";

import { ProfileSection } from "../settings/_components/profile-section";
import { AddressSection } from "../settings/_components/address-section";

export default function VendorProfilePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your business profile and address details.
        </p>
      </div>

      <div className="space-y-4">
        <ProfileSection />
        <AddressSection />
      </div>
    </section>
  );
}
