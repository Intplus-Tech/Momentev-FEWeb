/**
 * Booking API Types
 * POST /api/v1/bookings - Create a booking
 */

export interface BookingEventDetails {
  title: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  guestCount: number;
  description: string;
}

export interface BookingBudgetAllocation {
  vendorSpecialtyId: string;
  budgetedAmount: number;
}

export interface BookingLocation {
  addressText: string;
}

export interface CreateBookingPayload {
  vendorId: string;
  eventDetails: BookingEventDetails;
  budgetAllocations: BookingBudgetAllocation[];
  location: BookingLocation;
  currency: string;
}

export interface BookingResponse {
  _id: string;
  customerId: string;
  vendorId: string;
  eventDetails: BookingEventDetails;
  budgetAllocations: BookingBudgetAllocation[];
  location: BookingLocation;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "pending"
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
