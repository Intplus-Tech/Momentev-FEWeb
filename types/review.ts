// Canonical review types for frontend and API mapping

// Core API review object
export interface Review {
  _id: string;
  vendorId: string; // Ref to Vendor (id)
  bookingId: string; // Ref to Booking (id)
  reviewerUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number; // 1-5
  comment?: string;
  isEdited: boolean;
  isFlagged: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// Input payloads
export interface CreateReviewInput {
  vendorId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface FlagReviewInput {
  isFlagged: boolean;
}

export interface AdminReviewQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  reviewerUserId?: string;
  minRating?: number;
  maxRating?: number;
  isFlagged?: boolean;
}

// UI-friendly review shape used by components (flattened)
export interface ReviewUI {
  id: string;
  author: string;
  initials: string;
  avatar?: string;
  date: string;
  rawDate: string; // used for sorting
  rating: number;
  category?: string;
  content: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    stars: number;
    count: number;
  }[];
}
