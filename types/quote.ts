export type ValidityDuration = "7_days" | "14_days" | "30_days" | "custom";

export interface QuoteLineItem {
  service: string;
  quantity: number;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface QuotePaymentTerms {
  depositPercent: number;
  balancePercent: number;
}

export interface QuotePayload {
  quoteRequestId: string;
  lineItems: QuoteLineItem[];
  currency: "GBP";
  total: number;
  paymentTerms: QuotePaymentTerms;
  validityDuration: ValidityDuration;
  customExpiryDate?: string; // ISO datetime string, only when validityDuration === "custom"
  personalMessage?: string;
}

export type QuotePatchPayload = Partial<Omit<QuotePayload, "quoteRequestId">>;

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "changes_requested"
  | "revised"
  | "expired"
  | "withdrawn"
  | "converted";

export interface QuoteDraft {
  _id: string;
  quoteRequestId: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  currency: string;
  total: number;
  paymentTerms: QuotePaymentTerms;
  validityDuration: ValidityDuration;
  customExpiryDate?: string;
  personalMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorQuoteResponse extends Omit<QuoteDraft, "quoteRequestId"> {
  quoteRequestId: {
    _id: string;
    customerRequestId: {
      _id: string;
      serviceCategoryId: {
        _id: string;
        name: string;
      };
      customerId: string;
      eventDetails: {
        title: string;
        startDate: string;
        endDate?: string;
        guestCount?: number;
        location?: string;
        description?: string;
      };
      status: string;
    };
    customerId: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  };
  customerRequestId: string;
  vendorId: {
    _id: string;
    reviewCount: number;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  revision: number;
  sentAt?: string;
  expiresAt?: string;
}

export interface VendorQuoteListResponse {
  data: VendorQuoteResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface VendorQuoteFilters {
  status?: QuoteStatus;
  quoteRequestId?: string;
  page?: number;
  limit?: number;
}

// ── Client-side (customer) aliases ──────────────────────────────────────────

/** Identical shape to VendorQuoteResponse — the GET /quotes/me response */
export type CustomerQuote = VendorQuoteResponse;

export type QuoteDecision = "accept" | "decline" | "request_changes";

export interface QuoteResponsePayload {
  decision: QuoteDecision;
  customerNote?: string;
}

export interface CustomerQuoteListResponse {
  data: CustomerQuote[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerQuoteFilters {
  status?: QuoteStatus | "";
  quoteRequestId?: string;
}
