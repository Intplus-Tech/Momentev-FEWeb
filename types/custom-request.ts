export interface CustomRequestPayload {
  serviceCategoryId?: string; // Optional if not part of initial basic step, but likely derived
  eventDetails: {
    title: string;
    description: string;
    startDate: string; // ISO string
    startTime?: string;
    endTime?: string;
    guestCount: number;
    location: string;
    eventType: string;
  };
  vendorNeeds?: {
    categories: string[];
    specificRequirements: Record<string, string>;
  };
  budgetAllocations: {
    categoryName: string; // Or specific ID if mapped
    budgetedAmount: number;
  }[];
  attachments?: {
    fileUrl: string;
    fileName: string;
  }[];
  inspirationLinks?: string[];
  status?: "draft" | "pending_approval" | "approved" | "declined"; // Default: pending_approval
}

// Based on user provided sample response
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
    startDate: string;
    endDate: string;
    guestCount: number;
    location: string;
    description: string;
  };
  budgetAllocations: {
    serviceSpecialtyId: string;
    budgetedAmount: number;
  }[];
  attachments: any[]; // Define specific structure if known, empty in sample
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
