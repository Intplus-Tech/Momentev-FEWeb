export interface CustomRequestPayload {
  serviceCategoryId?: string;
  eventDetails: {
    title: string;
    description: string;
    startDate: string; // ISO datetime string
    endDate?: string; // ISO datetime string
    guestCount: number;
    location: string;
  };
  vendorNeeds?: {
    categories: string[];
    specificRequirements: Record<string, string>;
  };
  budgetAllocations: {
    serviceSpecialtyId: string;
    budgetedAmount: number;
  }[];
  attachments?: string[]; // Array of uploaded file IDs
}

// For PATCH updates to drafts — all fields are optional
export type DraftUpdatePayload = Partial<CustomRequestPayload>;

// Based on user provided sample response
export interface CustomerRequestAttachment {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  extension: string;
  provider: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  _id: string;
  serviceCategoryId?: {
    _id: string;
    name: string;
  } | null;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  eventDetails?: {
    title: string;
    startDate: string; // ISO datetime string
    endDate?: string; // ISO datetime string
    guestCount: number;
    location: string;
    description: string;
  };
  budgetAllocations: {
    serviceSpecialtyId:
    | string
    | {
      _id: string;
      name: string;
      description: string;
      serviceCategoryId: string;
    };
    budgetedAmount: number;
  }[];
  inspirationLinks?: string[];
  attachments: CustomerRequestAttachment[]; // Changed from any[] or string[]
  status: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequestListResponse {
  data: CustomerRequest[];
  total: number;
  page: number;
  limit: number;
}

export type CustomerRequestStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "rejected"
  | "cancelled";

export interface CustomerRequestFilters {
  serviceCategoryId?: string;
  status?: CustomerRequestStatus | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
