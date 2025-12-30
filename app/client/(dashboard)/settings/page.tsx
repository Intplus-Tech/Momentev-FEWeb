"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bookmark, MessageSquare, Shield, User2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { clientReviews, savedVendors } from "./data";
import { ProfileSection } from "./_components/profile-section";
import { ReviewsSection } from "./_components/reviews-section";
import { SavedVendorsSection } from "./_components/saved-vendors-section";
import { SecuritySection } from "./_components/security-section";

const validTabValues = ["profile", "saved", "reviews", "security"];

export default function ClientSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const validTabs = useMemo(() => new Set(validTabValues), []);

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
        <TabsList className="flex w-full flex-wrap gap-3 bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="gap-2 bg-muted px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-white"
          >
            <User2 className="h-4 w-4" />
            <span className="hidden sm:inline">Profile Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="gap-2 bg-muted px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-white"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved Vendors</span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="gap-2 bg-muted px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-white"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">My Reviews</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 bg-muted px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <SavedVendorsSection vendors={savedVendors} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsSection reviews={clientReviews} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection />
        </TabsContent>
      </Tabs>
    </section>
  );
}
