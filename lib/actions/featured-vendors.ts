"use server";

const API_URL = process.env.BACKEND_URL;

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/191429/pexels-photo-191429.jpeg?auto=compress&cs=tinysrgb&w=800";

export type FeaturedVendorItem = {
  id: string;
  slug: string;
  name: string;
  location: string;
  profession: string;
  image: string;
  rating: number;
  reviewCount: number;
};

type FeaturedVendorApi = {
  _id?: string;
  id?: string;
  rate?: number;
  reviewCount?: number;
  coverPhoto?: { url?: string } | string | null;
  profilePhoto?: { url?: string } | string | null;
  portfolioGallery?: Array<{ url?: string }>;
  businessProfile?: {
    businessName?: string;
    businessRegType?: string;
    serviceArea?: {
      areaNames?: Array<{
        city?: string;
        state?: string;
        country?: string;
      }>;
    };
  };
};

const formatProfession = (value?: string) => {
  if (!value) return "Event Vendor";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const imageUrl = (vendor: FeaturedVendorApi) => {
  if (vendor.coverPhoto && typeof vendor.coverPhoto === "object") {
    if (vendor.coverPhoto.url) return vendor.coverPhoto.url;
  }

  if (typeof vendor.coverPhoto === "string") return vendor.coverPhoto;

  const galleryImage = vendor.portfolioGallery?.find((item) => item?.url)?.url;
  if (galleryImage) return galleryImage;

  if (vendor.profilePhoto && typeof vendor.profilePhoto === "object") {
    if (vendor.profilePhoto.url) return vendor.profilePhoto.url;
  }

  if (typeof vendor.profilePhoto === "string") return vendor.profilePhoto;

  return FALLBACK_IMAGE;
};

const locationText = (vendor: FeaturedVendorApi) => {
  const area = vendor.businessProfile?.serviceArea?.areaNames?.[0];
  if (!area) return "Location unavailable";
  const parts = [area.city, area.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location unavailable";
};

export async function getFeaturedVendorsAction(
  limit = 10,
): Promise<FeaturedVendorItem[]> {
  if (!API_URL) return [];

  try {
    const response = await fetch(
      `${API_URL}/api/v1/vendors/featured?limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const payload = await response.json();
    const rawData = Array.isArray(payload?.data)
      ? (payload.data as FeaturedVendorApi[])
      : [];

    return rawData
      .map((vendor) => {
        const id = vendor.id || vendor._id || "";
        if (!id) return null;

        return {
          id,
          slug: id,
          name: vendor.businessProfile?.businessName || "Featured Vendor",
          location: locationText(vendor),
          profession: formatProfession(vendor.businessProfile?.businessRegType),
          image: imageUrl(vendor),
          rating: Number(vendor.rate ?? 0),
          reviewCount: Number(vendor.reviewCount ?? 0),
        };
      })
      .filter((item): item is FeaturedVendorItem => item !== null);
  } catch (error) {
    console.error("getFeaturedVendorsAction error:", error);
    return [];
  }
}
