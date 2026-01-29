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

  // UI Specific (Mapped or Mocked)
  bookings?: number;
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
