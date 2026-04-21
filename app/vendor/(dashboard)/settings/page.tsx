"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LifeBuoy, MessageSquare, Shield, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviews, supportPrefill } from "./data";
import { ReviewsSection } from "./_components/reviews-section";
import { SecuritySection } from "./_components/security-section";
import { SupportSection } from "./_components/support-section";
import { TeamSection } from "./_components/team-section";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useVendorReviews, useVendorDetails } from "@/hooks/api/use-vendors";
import { Loader2 } from "lucide-react";

const vendorTabValues = ["team", "reviews", "security", "support"];

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
    const fromQuery = searchParams.get("tab") ?? "team";
    return validTabs.has(fromQuery) ? fromQuery : "team";
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

  const { data: userProfile } = useUserProfile();
  // A vendor's profile ID is nested inside the userProfile object
  const vendorId = userProfile?.vendor?._id || userProfile?.vendor?.id || "";

  const { data: vendorDetailsResp } = useVendorDetails(vendorId);
  const vendorData = vendorDetailsResp?.data;

  const { data: reviewsData, isLoading: isReviewsLoading } = useVendorReviews(vendorId);

  // Map reviews from API
  const mappedReviews =
    reviewsData?.data?.data?.map((r: any) => ({
      id: r._id,
      author:
        `${r.reviewer?.firstName || ""} ${r.reviewer?.lastName || ""}`.trim() ||
        "Anonymous",
      initials:
        `${r.reviewer?.firstName?.[0] || ""}${r.reviewer?.lastName?.[0] || ""}`.toUpperCase() ||
        "?",
      date: new Date(r.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      rawDate: r.createdAt,
      rating: r.rating,
      category: "",
      content: r.comment,
    })) || [];

  // Calculate real star distribution from reviews
  const reviewStats = (() => {
    const reviewsArr = reviewsData?.data?.data || [];
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviewsArr.filter((r: any) => Math.round(r.rating) === stars).length,
    }));

    const totalCalculated = reviewsArr.length;
    const sumRating = reviewsArr.reduce((acc: number, r: any) => acc + r.rating, 0);
    const averageCalculated = totalCalculated > 0 ? sumRating / totalCalculated : 0;

    return {
      average: vendorData?.rate || Number(averageCalculated.toFixed(1)) || 0,
      total: vendorData?.reviewCount || totalCalculated,
      distribution,
    };
  })();

  return (
    <section className="space-y-4 h-full min-h-[85vh] flex flex-col">
      <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="bg-transparent flex items-center justify-between w-full gap-4">
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
            value="security"
            aria-label="Security"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
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

        <TabsContent value="team" className="space-y-4">
          <TeamSection />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {isReviewsLoading ? (
            <div className="flex h-40 items-center justify-center border rounded-xl bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ReviewsSection vendorId={vendorId} reviews={mappedReviews} stats={reviewStats} />
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection />
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
