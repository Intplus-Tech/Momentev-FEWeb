"use server";

import { z } from "zod";
import { VendorResponse, SearchFilters, NearbyFilters, Vendor } from "./types";
import { getAccessToken } from "@/lib/session";

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
  userId: z.object({
    _id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.object({
      url: z.string().optional()
    }).optional().nullable(),
    addressId: AddressSchema,
  }).optional(),
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

function formatAddress(vendor: RawVendor): string {
  const addr = vendor.businessProfile?.contactInfo?.addressId || vendor.userId?.addressId;
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
  const name = raw.businessProfile?.businessName ||
    (raw.userId?.firstName && raw.userId?.lastName ? `${raw.userId.firstName} ${raw.userId.lastName}` : "Unknown Vendor");

  const image = raw.coverPhoto || raw.profilePhoto || raw.userId?.avatar?.url || FALLBACK_IMAGE;

  // Build Service List
  const services = [];
  if (raw.serviceCategory?.name) services.push(raw.serviceCategory.name);
  if (raw.serviceSpecialty?.name) services.push(raw.serviceSpecialty.name);
  // Add mocks if list is too short for demo (Figma shows ~6 items)
  // In real app, we'd fetch actual services list.
  if (services.length < 4) {
    // Mocking some extra services for visual parity with Figma if real data is scarce
    // services.push("General Consultation", "Custom Request"); 
  }

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
    bookings: Math.floor(Math.random() * 500) + 10, // MOCK: Random booking count
    services: services
  };
}


export async function getVendorsAction(filters: SearchFilters): Promise<VendorResponse> {
  try {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams();

    if (filters.service && filters.service !== "all") params.append("service", filters.service);
    if (filters.specialty && filters.specialty !== "all") params.append("specialty", filters.specialty);
    if (filters.sort === "rating") params.append("sort", "rate_desc");

    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const url = `${BACKEND_URL}/api/v1/vendors/search?${params.toString()}`;

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(url, { method: "GET", headers, cache: "no-store" });

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
    const accessToken = await getAccessToken();
    const params = new URLSearchParams();

    params.append("lat", filters.lat.toString());
    params.append("long", filters.long.toString());
    if (filters.maxDistanceKm) params.append("maxDistanceKm", filters.maxDistanceKm.toString());
    if (filters.service && filters.service !== "all") params.append("service", filters.service);
    if (filters.specialty && filters.specialty !== "all") params.append("specialty", filters.specialty);

    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const url = `${BACKEND_URL}/api/v1/vendors/nearby?${params.toString()}`;

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(url, { method: "GET", headers, cache: "no-store" });

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
