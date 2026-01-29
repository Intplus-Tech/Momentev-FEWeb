export interface ServiceCategory {
  _id: string;
  name: string;
  icon: string;
  suggestedTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSpecialty {
  _id: string;
  name: string;
  serviceCategoryId: string;
  description: string;
  commissionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSpecialty {
  _id: string;
  vendorId: string;
  serviceSpecialty: string; // ID of the ServiceSpecialty
  priceCharge: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: {
    data: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface DirectArrayResponse<T> {
  message: string;
  data: T[];
}

export interface SuggestedTagsResponse {
  message: string;
  data: {
    tags: string[];
  };
}

export interface SingleResponse<T> {
  message: string;
  data: T;
}
