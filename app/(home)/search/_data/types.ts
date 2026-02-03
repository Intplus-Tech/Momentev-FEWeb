export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  serviceCategory?: {
    _id: string;
    name: string;
    description: string;
    coverImage: string;
  }; // Populated
  serviceSpecialty?: {
    _id: string;
    name: string;
  }; // Populated
  rate: number; // 0-5
  totalReviews: number;
  coverImage: string;
  address: string;

  // Specific fields from /nearby or /search
  distanceKm?: number; // returned by /nearby

  // Potential other fields based on usage
  bio?: string;
  gallery?: string[];
  workdays?: string; // Summary of availability

  // UI Specific (Mapped)
  services?: string[];
}

export interface VendorResponse {
  success: boolean;
  data: {
    data: Vendor[]; // The actual list
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface SearchFilters {
  q?: string;
  service?: string; // ID
  specialty?: string; // ID
  sort?: string; // rate_desc, rate_asc, etc.
  page?: number;
  limit?: number;
}

export interface NearbyFilters extends SearchFilters {
  lat: number;
  long: number;
  maxDistanceKm?: number;
}

// --- Vendor Details API Types ---

export interface Workday {
  dayOfWeek: string;
  open: string;
  close: string;
}

export interface ServiceArea {
  areaNames: {
    city: string;
    state: string;
    country: string;
  }[];
  travelDistance?: string;
}

export interface AddressInfo {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  primaryContactName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  addressId?: AddressInfo;
}

export interface BusinessProfile {
  _id: string;
  businessName?: string;
  yearInBusiness?: string;
  businessRegType?: string;
  businessDescription?: string;
  workdays?: Workday[];
  serviceArea?: ServiceArea;
  contactInfo?: ContactInfo;
}

export interface SocialMediaLink {
  name: string;
  link: string;
}

export interface VendorDetails {
  _id: string;
  userId: string;
  portfolioGallery: string[];
  rate: number;
  paymentAccountProvider?: string;
  paymentModel?: string;
  isActive: boolean;
  onBoardingStage: number;
  onBoarded: boolean;
  socialMediaLinks: SocialMediaLink[];
  commissionAgreement: {
    accepted: boolean;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  businessProfile?: BusinessProfile;
  onboardedAt?: string;
  reviewCount: number;
  id: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
}

export interface VendorDetailsResponse {
  message: string;
  data: VendorDetails;
}
