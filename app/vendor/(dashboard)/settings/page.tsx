"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LifeBuoy, MessageSquare, User2, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviews, supportPrefill, teamMembers } from "./data";
import { ProfileSection } from "./_components/profile-section";
import { AddressSection } from "./_components/address-section";
import { ReviewsSection } from "./_components/reviews-section";
import { SupportSection } from "./_components/support-section";
import { TeamSection } from "./_components/team-section";

const vendorTabValues = ["profile", "team", "reviews", "support"];

export default function VendorSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <VendorSettingsContent />
    </Suspense>
  );
}

function VendorSettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const validTabs = useMemo(() => new Set(vendorTabValues), []);

  const initialTab = useMemo(() => {
    const fromQuery = searchParams.get("tab") ?? "profile";
    return validTabs.has(fromQuery) ? fromQuery : "profile";
  }, [searchParams, validTabs]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const next = searchParams.get("tab");
    if (next && validTabs.has(next) && next !== activeTab) {
      setActiveTab(next);
    }
  }, [searchParams, validTabs, activeTab]);

  const handleTabChange = (value: string) => {
    if (!validTabs.has(value)) return;
    setActiveTab(value);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", value);
    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="bg-transparent flex items-center justify-between w-full gap-4">
          <TabsTrigger
            className="data-active:bg-black data-active:text-white p-3 sm:p-4 bg-muted data-active:hover:text-white cursor-pointer gap-2"
            value="profile"
            aria-label="Profile Settings"
          >
            <User2 className="h-4 w-4" />
            <span className="hidden sm:inline">Profile Settings</span>
          </TabsTrigger>
          <TabsTrigger
            className="data-active:bg-black data-active:text-white p-3 sm:p-4 bg-muted data-active:hover:text-white cursor-pointer gap-2"
            value="team"
            aria-label="Team"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger
            className="data-active:bg-black data-active:text-white p-3 sm:p-4 bg-muted data-active:hover:text-white cursor-pointer gap-2"
            value="reviews"
            aria-label="My Reviews"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">My Reviews</span>
          </TabsTrigger>
          <TabsTrigger
            className="data-active:bg-black data-active:text-white p-3 sm:p-4 bg-muted data-active:hover:text-white cursor-pointer gap-2"
            value="support"
            aria-label="Support"
          >
            <LifeBuoy className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSection />
          <AddressSection />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamSection members={teamMembers} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsSection reviews={reviews} />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportSection prefill={supportPrefill} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function SettingsSkeleton() {
  return (
    <section className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-96 w-full animate-pulse rounded-3xl bg-muted" />
    </section>
  );
}
