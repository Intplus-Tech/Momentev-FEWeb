/**
 * Business Profile API Types
 */

export interface BusinessProfileContactInfo {
  primaryContactName: string;
  emailAddress: string;
  phoneNumber: string;
  meansOfIdentification?: string;
  addressId?: string;
}

export interface BusinessDocument {
  docName: string;
  file: string; // File ID from upload
}

export interface ServiceAreaLocation {
  city: string;
  state: string;
  country: string;
}

export interface ServiceArea {
  travelDistance: string;
  areaNames: ServiceAreaLocation[];
}

export interface Workday {
  dayOfWeek: string;
  open: string;
  close: string;
}

export interface BusinessProfilePayload {
  vendorId: string; // Required from user profile
  contactInfo: BusinessProfileContactInfo;
  businessName: string;
  yearInBusiness: string;
  companyRegNo: string;
  businessRegType: string;
  businessDescription?: string;
  businessDocuments?: BusinessDocument[];
  serviceArea: ServiceArea;
  workdays?: Workday[];
}

export interface BusinessProfileResponse {
  message: string;
  data: {
    _id: string;
    vendorId: string;
    businessDescription?: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Public vendor profile type (from GET /api/v1/vendors/{vendorId})
 * Used for displaying vendor details in chat and other public views
 */
export interface VendorPublicProfile {
  _id: string;
  userId: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  businessProfile: {
    businessName: string;
    businessDescription?: string;
    workdays?: {
      dayOfWeek: string;
      open: string;
      close: string;
    }[];
  };
  profilePhoto?: {
    url: string;
  };
  coverPhoto?: {
    url: string;
  } | null;
  portfolioGallery?: {
    url: string;
  }[];
  rate?: number;
  reviewCount?: number;
  socialMediaLinks?: {
    name: string;
    link: string;
  }[];
  isActive: boolean;
  onBoarded: boolean;
  createdAt: string;
  updatedAt: string;
}

