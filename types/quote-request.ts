export type QuoteRequestStatus =
  | "new"
  | "responded"
  | "accepted"
  | "completed"
  | "expired"
  | "closed";

export interface BudgetAllocation {
  serviceSpecialtyId: string;
  budgetedAmount: number;
  _id: string;
}

export interface CustomerRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface ServiceCategoryRef {
  _id: string;
  name: string;
}

export interface EventDetails {
  title: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  location: string;
  description: string;
}

export interface CustomerRequestRef {
  _id: string;
  serviceCategoryId: ServiceCategoryRef;
  customerId: CustomerRef;
  eventDetails: EventDetails;
  budgetAllocations: BudgetAllocation[];
  attachments: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  approvedAt?: string | null;
}

export interface VendorQuoteRequest {
  _id: string;
  customerRequestId: CustomerRequestRef;
  customerId: CustomerRef;
  status: QuoteRequestStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VendorQuoteRequestListResponse {
  data: VendorQuoteRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface VendorQuoteRequestFilters {
  status?: QuoteRequestStatus | "";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
