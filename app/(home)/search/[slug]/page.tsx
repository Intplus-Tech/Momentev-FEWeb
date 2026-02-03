"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useVendorDetails,
  useVendorReviews,
  useVendorServices,
  useVendorSpecialties,
} from "../_data/hooks";
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

  // Fetch reviews and services (hooks must be called unconditionally)
  const { data: reviewsData } = useVendorReviews(vendorId);
  const { data: servicesData } = useVendorServices(vendorId);
  const { data: specialtiesData } = useVendorSpecialties(vendorId);

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

  // Debug: Log all fetched data
  console.log("Vendor ID:", vendorId);
  console.log("Services Data:", JSON.stringify(servicesData, null, 2));
  console.log("Specialties Data:", JSON.stringify(specialtiesData, null, 2));
  console.log("======================================");

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
        email: vendorData.businessProfile?.contactInfo?.emailAddress || "",
        phone: vendorData.businessProfile?.contactInfo?.phoneNumber || "",
        contactName:
          vendorData.businessProfile?.contactInfo?.primaryContactName || "",
        address: vendorData.businessProfile?.contactInfo?.addressId
          ? `${vendorData.businessProfile.contactInfo.addressId.street}, ${vendorData.businessProfile.contactInfo.addressId.city}, ${vendorData.businessProfile.contactInfo.addressId.state} ${vendorData.businessProfile.contactInfo.addressId.postalCode}, ${vendorData.businessProfile.contactInfo.addressId.country}`
          : vendorData.businessProfile?.serviceArea?.areaNames
            ? vendorData.businessProfile.serviceArea.areaNames
                .map((a) => `${a.city}, ${a.state}`)
                .join(" | ")
            : "Address not available",
        social: Object.fromEntries(
          vendorData.socialMediaLinks?.map((s) => [s.name, s.link]) || [],
        ),
        workdays: formatWorkdaysSummary(vendorData.businessProfile?.workdays),
        // Map specialties to services section
        servicesList: specialtiesData?.data?.data?.length
          ? [
              {
                category: "Specialties",
                items:
                  specialtiesData.data.data.map((s) => ({
                    name: s.serviceSpecialty.name,
                    description: s.serviceSpecialty.description,
                    price: `${s.price} (${s.priceCharge?.replace(/_/g, " ") || ""})`,
                  })) || [],
              },
            ]
          : [],
        // Map reviews from API
        reviews:
          reviewsData?.data?.data?.map((r) => ({
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
            rating: r.rating,
            category: "",
            content: r.comment,
          })) || [],
        // Calculate real star distribution from reviews
        reviewStats: (() => {
          const reviews = reviewsData?.data?.data || [];
          const distribution = [5, 4, 3, 2, 1].map((stars) => ({
            stars,
            count: reviews.filter((r) => Math.round(r.rating) === stars).length,
          }));
          return {
            average: vendorData.rate || 0,
            total: vendorData.reviewCount || 0,
            distribution,
          };
        })(),
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
                contactName={vendor.contactName}
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
