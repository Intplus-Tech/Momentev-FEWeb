"use client";

import { useState, useEffect } from "react";
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
  BookingModal,
} from "../_vendor-components";
import { getVendorBySlug } from "../_vendor-data/vendorDetails";
import type { VendorServiceCategory } from "@/types/vendor-services";

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

// Helper to extract URL from string or object
function getImageUrl(
  photo: string | { url: string } | null | undefined,
): string | null {
  if (!photo) return null;
  if (typeof photo === "string") return photo;
  return photo.url;
}

const LEAD_TIME_PRIORITY: Record<string, number> = {
  flexible: 0,
  a_week: 7,
  one_week: 7,
  two_weeks: 14,
  four_weeks: 28,
};

function getVendorLeadTimeRequired(
  services?: { leadTimeRequired?: string | null }[],
): string | undefined {
  const values = services
    ?.map((service) => service.leadTimeRequired)
    .filter((value): value is string => !!value);

  if (!values?.length) {
    return undefined;
  }

  return values.reduce((current, next) => {
    const currentPriority = LEAD_TIME_PRIORITY[current] ?? 0;
    const nextPriority = LEAD_TIME_PRIORITY[next] ?? 0;

    return nextPriority > currentPriority ? next : current;
  });
}

export default function VendorPage() {
  const params = useParams();
  const vendorId = params.slug as string;
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Try fetching from API
  const { data: apiVendor, isLoading, isError } = useVendorDetails(vendorId);

  // Fetch reviews and services (hooks must be called unconditionally)
  const [reviewsPage, setReviewsPage] = useState(1);
  const REVIEWS_LIMIT = 10;
  const { data: reviewsData, isFetching: isFetchingReviews } = useVendorReviews(vendorId, reviewsPage, REVIEWS_LIMIT);
  const { data: servicesData } = useVendorServices(vendorId);
  const { data: specialtiesData } = useVendorSpecialties(vendorId);

  // Accumulate paginated reviews locally — start with first page if available
  const [accumulatedReviews, setAccumulatedReviews] = useState<any[]>([]);

  // When a new page of reviewsData arrives, append unique items
  useEffect(() => {
    if (reviewsData && reviewsData.data && Array.isArray(reviewsData.data.data)) {
      const incoming = reviewsData.data.data;
      setAccumulatedReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        const toAppend = incoming.filter((r: any) => !existingIds.has(r._id));
        if (toAppend.length === 0) return prev;
        return [...prev, ...toAppend];
      });
    }
  }, [reviewsData]);

  // Reset accumulated reviews when vendor changes
  useEffect(() => {
    setAccumulatedReviews([]);
    setReviewsPage(1);
  }, [vendorId]);

  // Fallback to mock data if API fails or while loading
  const mockVendor = getVendorBySlug(vendorId);
  const vendorLeadTimeRequired = getVendorLeadTimeRequired(
    servicesData?.data?.data,
  );
  const serviceCategories = (servicesData?.data?.data ?? []).reduce<
    VendorServiceCategory[]
  >((acc, service) => {
    if (!acc.find((category) => category._id === service.serviceCategory._id)) {
      acc.push(service.serviceCategory);
    }
    return acc;
  }, []);

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


  const reviews = accumulatedReviews.length > 0 ? accumulatedReviews : (reviewsData?.data?.data || []);
  const totalReviewCount = reviewsData?.data?.total ?? reviews.length;
  const calculatedAverageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;
  const displayRating =
    totalReviewCount > 0
      ? Number(calculatedAverageRating.toFixed(1))
      : vendorData?.rate || 0;
  const displayReviewCount =
    totalReviewCount > 0 ? totalReviewCount : vendorData?.reviewCount || 0;


  // Build services list from services and specialties
  const servicesList: {
    category: string;
    items: {
      name: string;
      description?: string;
      price: string;
      tags?: string[];
      meta?: string;
    }[];
  }[] = [];

  const titleCase = (value?: string | null) =>
    value
      ? value
        .replace(/_/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      : undefined;

  if (servicesData?.data?.data?.length) {
    servicesList.push({
      category: "Service Category",
      items: servicesData.data.data.map((service) => ({
        name: service.serviceCategory.name,
        description: undefined,
        tags: service.tags || [],
        meta:
          [
            service.leadTimeRequired
              ? `Lead time: ${titleCase(service.leadTimeRequired)}`
              : null,
            service.maximumEventSize
              ? `Max event size: ${service.maximumEventSize}`
              : null,
          ]
            .filter(Boolean)
            .join(" • ") || undefined,
        price:
          titleCase(service.minimumBookingDuration) ||
          titleCase(service.leadTimeRequired) ||
          "Contact for quote",
      })),
    });
  }

  if (specialtiesData?.data?.data?.length) {
    servicesList.push({
      category: "Specialties",
      items:
        specialtiesData.data.data.map((s) => ({
          name: s.serviceSpecialty.name,
          description: s.serviceSpecialty.description,
          price: `${s.price} (${s.priceCharge?.replace(/_/g, " ") || ""})`,
        })) || [],
    });
  }

  // Transform API data to component format, or use mock
  const vendor = vendorData
    ? {
      id: vendorData._id,
      name: vendorData.businessProfile?.businessName || "Unknown Vendor",
      rating: displayRating,
      reviewCount: displayReviewCount,
      logo: getImageUrl(vendorData.profilePhoto),
      gallery: (() => {
        // Extract URLs from portfolioGallery (can be strings or objects with url)
        const galleryUrls = vendorData.portfolioGallery
          .map(getImageUrl)
          .filter((url): url is string => url !== null);

        if (galleryUrls.length > 0) return galleryUrls;

        // Fallback to coverPhoto
        const coverUrl = getImageUrl(vendorData.coverPhoto);
        if (coverUrl) return [coverUrl];

        // Final fallback
        return [
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
        ];
      })(),
      about:
        vendorData.businessProfile?.businessDescription ||
        "No description available.",
      // Extract website from social media links if exists
      website:
        vendorData.socialMediaLinks?.find(
          (s) => s.name.toLowerCase() === "website",
        )?.link || "",
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
      // Map services and specialties to services section
      servicesList,
      // Map reviews from accumulated paginated data
      reviews: reviews.map((r) => ({
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
      })) || [],
      // Calculate real star distribution from reviews
      reviewStats: (() => {
        const distribution = [5, 4, 3, 2, 1].map((stars) => ({
          stars,
          count: reviews.filter((r) => Math.round(r.rating) === stars).length,
        }));

        return {
          average: displayRating,
          total: displayReviewCount,
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
              logo={vendor.logo}
              rating={vendor.rating}
              reviewCount={vendor.reviewCount}
              vendorId={vendorId}
              onBookVendor={() => setIsBookingModalOpen(true)}
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
              vendorId={vendorId}
              reviews={vendor.reviews}
              stats={vendor.reviewStats}
            />
            {totalReviewCount !== undefined && reviews.length < totalReviewCount && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setReviewsPage((p) => p + 1)}
                  disabled={isFetchingReviews}
                >
                  {isFetchingReviews ? "Loading..." : "Load more reviews"}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Contact Sidebar */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-28">
              <ContactSidebar
                logo={vendor.logo}
                website={vendor.website}
                email={vendor.email}
                phone={vendor.phone}
                contactName={vendor.contactName}
                address={vendor.address}
                social={vendor.social}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        key={`${vendorId}-${vendorLeadTimeRequired ?? "flexible"}`}
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        vendorId={vendorId}
        vendorName={vendor.name}
        serviceCategories={serviceCategories}
        specialties={specialtiesData?.data?.data}
        vendorLeadTimeRequired={vendorLeadTimeRequired}
      />
    </div>
  );
}
