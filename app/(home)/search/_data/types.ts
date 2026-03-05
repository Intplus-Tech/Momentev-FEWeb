export interface VendorServiceTag {
  _id: string;
  vendorId: string;
  serviceCategory: {
    _id: string;
    name: string;
  };
  tags: string[];
  minimumBookingDuration?: string;
  leadTimeRequired?: string;
  maximumEventSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSpecialty {
  _id: string;
  vendorId: string;
  serviceSpecialty: {
    _id: string;
    name: string;
  };
  priceCharge?: string;
  price?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  id: string;
  slug?: string;
  rate: number;
  reviewCount: number;
  coverPhoto?: { _id: string; url: string } | null;
  profilePhoto?: { _id: string; url: string } | null;
  portfolioGallery?: { _id: string; url: string }[];
  businessProfile?: {
    _id: string;
    businessName?: string;
    yearInBusiness?: string;
    businessRegType?: string;
    businessDescription?: string;
    workdays?: { dayOfWeek: string; open: string; close: string }[];
    serviceArea?: {
      areaNames: { city?: string; state?: string; country?: string }[];
      travelDistance?: string;
    };
    contactInfo?: {
      primaryContactName?: string;
      emailAddress?: string;
      phoneNumber?: string;
      addressId?: {
        _id: string;
        street: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    };
  };
  vendorServices?: VendorServiceTag[];
  vendorSpecialties?: VendorSpecialty[];
  isActive?: boolean;

  // Specific fields from /nearby
  distanceKm?: number;

  // Computed/mapped helpers kept for backwards compat
  name?: string;         // mapped from businessProfile.businessName
  address?: string;      // mapped from businessProfile.contactInfo.addressId
  coverImage?: string;   // legacy
  totalReviews?: number; // legacy alias for reviewCount
  workdays?: string;     // legacy summary string
  services?: string[];   // legacy
}

export interface VendorResponse {
  success: boolean;
  data: {
    data: Vendor[];
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
  sort?: string;
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
  portfolioGallery: (string | { url: string })[];
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
  profilePhoto: string | { url: string } | null;
  coverPhoto: string | { url: string } | null;
}

export interface VendorDetailsResponse {
  message: string;
  data: VendorDetails;
}
