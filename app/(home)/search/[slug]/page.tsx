"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorDetails } from "../_data/hooks";
import {
  VendorGallery,
  VendorHeader,
  ContactSidebar,
  ServicesSection,
  ReviewsSection,
} from "../_vendor-components";
import { getVendorBySlug } from "../_vendor-data/vendorDetails";

// Helper to format workdays from API response
function formatWorkdaysSummary(
  workdays?: { dayOfWeek: string; open: string; close: string }[],
): string {
  if (!workdays || workdays.length === 0) return "Hours not available";
  const days = workdays.map((w) => w.dayOfWeek.slice(0, 3)).join(", ");
  const times =
    workdays.length > 0 ? `${workdays[0].open} - ${workdays[0].close}` : "";
  return `${days} ${times}`;
}

export default function VendorPage() {
  const params = useParams();
  const vendorId = params.slug as string;

  // Try fetching from API
  const { data: apiVendor, isLoading, isError } = useVendorDetails(vendorId);

  // Fallback to mock data if API fails or while loading
  const mockVendor = getVendorBySlug(vendorId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fall back to mock
  const vendorData = apiVendor?.data;

  // If no API data and no mock data, show 404
  if (!vendorData && !mockVendor) {
    notFound();
  }

  // Transform API data to component format, or use mock
  const vendor = vendorData
    ? {
        id: vendorData._id,
        name: vendorData.businessProfile?.businessName || "Unknown Vendor",
        rating: vendorData.rate || 0,
        reviewCount: vendorData.reviewCount || 0,
        gallery:
          vendorData.portfolioGallery.length > 0
            ? vendorData.portfolioGallery
            : vendorData.coverPhoto
              ? [vendorData.coverPhoto]
              : [
                  "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
                ],
        about:
          vendorData.businessProfile?.businessDescription ||
          "No description available.",
        tags: vendorData.socialMediaLinks?.map((s) => s.name) || [],
        website: "",
        email: "",
        phone: "",
        address: vendorData.businessProfile?.serviceArea?.areaNames
          ? vendorData.businessProfile.serviceArea.areaNames
              .map((a) => `${a.city}, ${a.state}`)
              .join(" | ")
          : "Address not available",
        social: Object.fromEntries(
          vendorData.socialMediaLinks?.map((s) => [s.name, s.link]) || [],
        ),
        workdays: formatWorkdaysSummary(vendorData.businessProfile?.workdays),
        servicesList: [], // Services would need a separate API call
        reviews: [], // Reviews would need a separate API call
        reviewStats: {
          average: vendorData.rate || 0,
          total: vendorData.reviewCount || 0,
          distribution: [
            {
              stars: 5,
              count: Math.round((vendorData.reviewCount || 0) * 0.7),
            },
            {
              stars: 4,
              count: Math.round((vendorData.reviewCount || 0) * 0.2),
            },
            {
              stars: 3,
              count: Math.round((vendorData.reviewCount || 0) * 0.07),
            },
            {
              stars: 2,
              count: Math.round((vendorData.reviewCount || 0) * 0.03),
            },
            { stars: 1, count: 0 },
          ],
        },
      }
    : mockVendor!;

  return (
    <div className="min-h-screen pt-40 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          className="mb-6 bg-gray-300 gap-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/search">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Gallery */}
            <VendorGallery images={vendor.gallery} vendorName={vendor.name} />

            {/* Vendor Header */}
            <VendorHeader
              name={vendor.name}
              rating={vendor.rating}
              reviewCount={vendor.reviewCount}
              tags={vendor.tags}
            />

            {/* About Section */}
            <div className="space-y-4 bg-white dark:bg-gray-900 p-4 rounded-2xl">
              <h2 className="text-lg font-semibold">About the company</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {vendor.about}
              </p>
            </div>

            {/* Services */}
            <ServicesSection services={vendor.servicesList} />

            {/* Reviews */}
            <ReviewsSection
              reviews={vendor.reviews}
              stats={vendor.reviewStats}
            />
          </div>

          {/* Right Column - Contact Sidebar */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-28">
              <ContactSidebar
                website={vendor.website}
                email={vendor.email}
                phone={vendor.phone}
                address={vendor.address}
                social={vendor.social}
                tags={vendor.tags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
