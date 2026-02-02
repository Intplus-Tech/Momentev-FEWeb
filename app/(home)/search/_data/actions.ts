"use server";

import { z } from "zod";
import { VendorResponse, SearchFilters, NearbyFilters, Vendor, VendorDetailsResponse } from "./types";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  console.warn("BACKEND_URL is not defined in environment variables");
}

const FALLBACK_IMAGE = "https://images.pexels.com/photos/191429/pexels-photo-191429.jpeg?auto=compress&cs=tinysrgb&w=800"; // TODO: Replace with brand placeholder

// --- RAW SCHEMA (Matches API Response) ---

const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
}).optional();

const WorkdaySchema = z.object({
  dayOfWeek: z.string(),
  open: z.string(),
  close: z.string(),
});

const RawVendorSchema = z.object({
  _id: z.string(),
  rate: z.number().optional().default(0),
  reviewCount: z.number().optional().default(0),
  profilePhoto: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
  // userId can be either a string (ID) or a populated object
  userId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      avatar: z.object({
        url: z.string().optional()
      }).optional().nullable(),
      addressId: AddressSchema,
    })
  ]).optional(),
  businessProfile: z.object({
    businessName: z.string().optional(),
    businessDescription: z.string().optional(),
    workdays: z.array(WorkdaySchema).optional(),
    contactInfo: z.object({
      addressId: AddressSchema
    }).optional()
  }).optional(),
  serviceCategory: z.object({
    _id: z.string(),
    name: z.string(),
  }).optional(),
  serviceSpecialty: z.object({
    _id: z.string(),
    name: z.string(),
  }).optional(),
  distanceKm: z.number().optional()
});

const RawApiResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  message: z.string().optional(),
  data: z.object({
    data: z.array(RawVendorSchema),
    total: z.number().optional().default(0),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
  }),
});

type RawVendor = z.infer<typeof RawVendorSchema>;

// --- MAPPING HELPERS ---

// Helper to safely get userId as object (if populated) or null
function getUserIdObject(userId: RawVendor['userId']): Exclude<RawVendor['userId'], string> | null {
  if (!userId || typeof userId === 'string') return null;
  return userId;
}

function formatAddress(vendor: RawVendor): string {
  const userIdObj = getUserIdObject(vendor.userId);
  const addr = vendor.businessProfile?.contactInfo?.addressId || userIdObj?.addressId;
  if (!addr) return "Location unavailable";
  const parts = [addr.city, addr.state, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location unavailable";
}

function formatWorkdays(workdays?: { dayOfWeek: string; open: string; close: string }[]): string | undefined {
  if (!workdays || workdays.length === 0) return undefined;
  const uniqueTimes = Array.from(new Set(workdays.map(d => `${d.open} - ${d.close}`)));
  const timeString = uniqueTimes.length === 1 ? uniqueTimes[0] : "Varies";
  const days = workdays.length;
  if (days >= 5) return `Mon - Fri, ${timeString}`;
  if (days > 0) return `${days} days/week, ${timeString}`;
  return undefined;
}

function mapRawToUIVendor(raw: RawVendor): Vendor {
  const userIdObj = getUserIdObject(raw.userId);
  const name = raw.businessProfile?.businessName ||
    (userIdObj?.firstName && userIdObj?.lastName ? `${userIdObj.firstName} ${userIdObj.lastName}` : "Unknown Vendor");

  const image = raw.coverPhoto || raw.profilePhoto || userIdObj?.avatar?.url || FALLBACK_IMAGE;

  // Build Service List
  const services = [];
  if (raw.serviceCategory?.name) services.push(raw.serviceCategory.name);
  if (raw.serviceSpecialty?.name) services.push(raw.serviceSpecialty.name);

  return {
    _id: raw._id,
    name: name,
    slug: raw._id,
    serviceCategory: raw.serviceCategory ? {
      _id: raw.serviceCategory._id,
      name: raw.serviceCategory.name,
      description: "",
      coverImage: ""
    } : undefined,
    serviceSpecialty: raw.serviceSpecialty ? {
      _id: raw.serviceSpecialty._id,
      name: raw.serviceSpecialty.name
    } : undefined,
    rate: raw.rate ?? 0,
    totalReviews: raw.reviewCount ?? 0,
    coverImage: image,
    address: formatAddress(raw),
    distanceKm: raw.distanceKm,
    workdays: formatWorkdays(raw.businessProfile?.workdays),
    services: services
  };
}


export async function getVendorsAction(filters: SearchFilters): Promise<VendorResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.service && filters.service !== "all") params.append("service", filters.service);
    if (filters.specialty && filters.specialty !== "all") params.append("specialty", filters.specialty);
    if (filters.sort === "rating") params.append("sort", "rate_desc");

    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const url = `${BACKEND_URL}/api/v1/vendors/search?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });

    if (!res.ok) {
      console.error(`API Error ${res.status}: ${res.statusText}`);
      return { success: false, message: `Failed: ${res.status}`, data: { data: [], total: 0, page: 1, limit: 10 } };
    }

    const rawData = await res.json();
    const parsed = RawApiResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error("Zod Parsing Failed:", parsed.error);
      return { success: false, message: "Invalid API response", data: { data: [], total: 0, page: 1, limit: 10 } };
    }

    const mappedVendors = parsed.data.data.data.map(mapRawToUIVendor);

    let totalItems = parsed.data.data.total;

    // Client-Side Filter
    let finalVendors = mappedVendors;
    if (filters.q && filters.q.trim().length > 0) {
      const query = filters.q.toLowerCase();
      finalVendors = mappedVendors.filter(v => v.name.toLowerCase().includes(query));
      totalItems = finalVendors.length;
    }

    return {
      success: true,
      data: {
        data: finalVendors,
        total: totalItems,
        page: parsed.data.data.page,
        limit: parsed.data.data.limit
      }
    };

  } catch (error) {
    console.error("getVendorsAction error:", error);
    return { success: false, message: "Error", data: { data: [], total: 0, page: 1, limit: 10 } };
  }
}

export async function getNearbyVendorsAction(filters: NearbyFilters): Promise<VendorResponse> {
  try {
    const params = new URLSearchParams();

    params.append("lat", filters.lat.toString());
    params.append("long", filters.long.toString());
    if (filters.maxDistanceKm) params.append("maxDistanceKm", filters.maxDistanceKm.toString());
    if (filters.service && filters.service !== "all") params.append("service", filters.service);
    if (filters.specialty && filters.specialty !== "all") params.append("specialty", filters.specialty);

    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const url = `${BACKEND_URL}/api/v1/vendors/nearby?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });

    if (!res.ok) {
      return { success: false, message: `Failed: ${res.status}`, data: { data: [], total: 0, page: 1, limit: 10 } };
    }

    const rawData = await res.json();
    const parsed = RawApiResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error("Zod Validation Failed (Nearby):", parsed.error);
      return { success: false, message: "Invalid API response", data: { data: [], total: 0, page: 1, limit: 10 } };
    }

    const mappedVendors = parsed.data.data.data.map(mapRawToUIVendor);
    let totalItems = parsed.data.data.total;

    // Client-Side Filter
    let finalVendors = mappedVendors;
    if (filters.q && filters.q.trim().length > 0) {
      const query = filters.q.toLowerCase();
      finalVendors = mappedVendors.filter(v => v.name.toLowerCase().includes(query));
      totalItems = finalVendors.length;
    }

    return {
      success: true,
      data: {
        data: finalVendors,
        total: totalItems,
        page: parsed.data.data.page,
        limit: parsed.data.data.limit
      }
    };

  } catch (error) {
    console.error("getNearbyVendorsAction error:", error);
    return { success: false, message: "Error", data: { data: [], total: 0, page: 1, limit: 10 } };
  }
}

// --- Vendor Details Action ---

const VendorDetailsSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  portfolioGallery: z.array(z.string()).optional().default([]),
  rate: z.number().optional().default(0),
  paymentAccountProvider: z.string().optional(),
  paymentModel: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  onBoardingStage: z.number().optional().default(0),
  onBoarded: z.boolean().optional().default(false),
  socialMediaLinks: z.array(z.object({
    name: z.string(),
    link: z.string()
  })).optional().default([]),
  commissionAgreement: z.object({
    accepted: z.boolean().optional().default(false)
  }).optional().default({ accepted: false }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  businessProfile: z.object({
    _id: z.string(),
    businessName: z.string().optional(),
    yearInBusiness: z.string().optional(),
    businessRegType: z.string().optional(),
    businessDescription: z.string().optional(),
    workdays: z.array(z.object({
      dayOfWeek: z.string(),
      open: z.string(),
      close: z.string()
    })).optional(),
    serviceArea: z.object({
      areaNames: z.array(z.object({
        city: z.string(),
        state: z.string(),
        country: z.string()
      })).optional(),
      travelDistance: z.string().optional()
    }).optional()
  }).optional(),
  onboardedAt: z.string().optional(),
  reviewCount: z.number().optional().default(0),
  profilePhoto: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional()
});

const VendorDetailsResponseSchema = z.object({
  message: z.string(),
  data: VendorDetailsSchema
});

export async function getVendorDetailsAction(vendorId: string): Promise<VendorDetailsResponse | null> {
  try {
    const url = `${BACKEND_URL}/api/v1/vendors/${vendorId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });

    if (!res.ok) {
      console.error(`Vendor Details API Error ${res.status}: ${res.statusText}`);
      return null;
    }

    const rawData = await res.json();
    const parsed = VendorDetailsResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error("Vendor Details Zod Parsing Failed:", parsed.error);
      return null;
    }

    return parsed.data as VendorDetailsResponse;

  } catch (error) {
    console.error("getVendorDetailsAction error:", error);
    return null;
  }
}

