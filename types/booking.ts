/**
 * Booking API Types
 * POST /api/v1/bookings - Create a booking
 */

// Social media link
export interface SocialMediaLink {
  name: string;
  link: string;
}

// Commission agreement
export interface CommissionAgreement {
  accepted: boolean;
  acceptedAt: string;
  version: string;
  commissionType: string;
  commissionAmount: number;
  currency: string;
}

// Populated vendor data
export interface PopulatedVendor {
  _id: string;
  userId: string;
  portfolioGallery: string[];
  rate: number;
  paymentAccountProvider: string;
  paymentModel: string;
  isActive: boolean;
  onBoardingStage: number;
  onBoarded: boolean;
  socialMediaLinks: SocialMediaLink[];
  commissionAgreement: CommissionAgreement;
  createdAt: string;
  updatedAt: string;
  __v: number;
  businessProfile?: string;
  onboardedAt?: string;
  coverPhoto?: string;
  profilePhoto?: string;
  reviewCount: number;
  id: string;
}

// Populated customer data
export interface PopulatedCustomer {
  customerFavoriteVendors: string[];
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  role: string;
  status: string;
  emailVerified: boolean;
  authProvider: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastActiveAt?: string;
  lastLoginAt?: string;
  addressId?: string;
  avatar?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  stripeCustomerId?: string;
  id: string;
}

// Populated vendor specialty
export interface PopulatedVendorSpecialty {
  _id: string;
  vendorId: string;
  serviceSpecialty: string;
  priceCharge: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BookingEventDetails {
  title: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  guestCount: number;
  description: string;
}

export interface BookingBudgetAllocation {
  vendorSpecialtyId: string | PopulatedVendorSpecialty;
  budgetedAmount: number;
}

export interface BookingLocation {
  addressText: string;
}

export interface BookingAmounts {
  subtotal: number;
  fees: number;
  commission: number;
  total: number;
}

export interface CreateBookingPayload {
  vendorId: string;
  eventDetails: BookingEventDetails;
  budgetAllocations: BookingBudgetAllocation[];
  location: BookingLocation;
  currency: string;
}

export interface BookingPayment {
  provider: string;
  status: string;
  paymentIntentId?: string;
}

export interface BookingResponse {
  _id: string;
  customerId: string | PopulatedCustomer;
  vendorId: string | PopulatedVendor;
  eventDetails: BookingEventDetails;
  budgetAllocations: BookingBudgetAllocation[];
  location: BookingLocation;
  currency: string;
  amounts: BookingAmounts;
  paymentModel: string;
  status: BookingStatus;
  payment?: BookingPayment;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type BookingStatus =
  | "pending"
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rejected";

export interface BookingListResponse {
  data: BookingResponse[];
  total: number;
  page: number;
  limit: number;
}
