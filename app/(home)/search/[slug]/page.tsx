import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVendorBySlug } from "../_vendor-data/vendorDetails";
import {
  VendorGallery,
  VendorHeader,
  ContactSidebar,
  ServicesSection,
  ReviewsSection,
} from "../_vendor-components";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendor = getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
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
            <div className="space-y-4 bg-white p-4 rounded-2xl">
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
