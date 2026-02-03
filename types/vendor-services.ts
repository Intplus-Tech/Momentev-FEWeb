// Types for Vendor Services and Specialties API responses

export interface VendorServiceCategory {
  _id: string;
  name: string;
}

export interface VendorServiceFee {
  name: string;
  price: string;
  feeCategory: string;
}

export interface VendorService {
  _id: string;
  vendorId: string;
  serviceCategory: VendorServiceCategory;
  tags: string[];
  minimumBookingDuration: string;
  leadTimeRequired: string;
  maximumEventSize: string;
  additionalFees: VendorServiceFee[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorSpecialtyDetails {
  _id: string;
  name: string;
  description: string;
}

export interface VendorSpecialtyItem {
  _id: string;
  vendorId: string;
  serviceSpecialty: VendorSpecialtyDetails;
  priceCharge: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorServicesResponse {
  message: string;
  data: {
    data: VendorService[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface VendorSpecialtiesResponse {
  message: string;
  data: {
    data: VendorSpecialtyItem[];
    total: number;
    page: number;
    limit: number;
  };
}

// Vendor Reviews Types
export interface VendorReviewer {
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface VendorReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: VendorReviewer;
}

export interface VendorReviewsResponse {
  message: string;
  data: {
    data: VendorReview[];
    total: number;
    page: number;
    limit: number;
  };
}
