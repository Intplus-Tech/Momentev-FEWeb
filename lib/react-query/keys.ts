/**
 * Query Keys Factory
 * 
 * Use this file to define query keys.
 * This ensures consistency and makes it easier to invalidate queries.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  address: {
    all: ['address'] as const,
    detail: (id: string) => [...queryKeys.address.all, id] as const,
  },
  // Add more domains as needed
  // vendors: { ... }
  vendor: {
    all: ['vendor'] as const,
    staff: () => [...queryKeys.vendor.all, 'staff'] as const,
    permissions: () => [...queryKeys.vendor.all, 'permissions'] as const,
    profile: (vendorId: string) => [...queryKeys.vendor.all, 'profile', vendorId] as const,
    stripeAccount: () => [...queryKeys.vendor.all, 'stripeAccount'] as const,
    balance: () => [...queryKeys.vendor.all, 'balance'] as const,
    earnings: () => [...queryKeys.vendor.all, 'earnings'] as const,
    payouts: () => [...queryKeys.vendor.all, 'payouts'] as const,
    paymentMethods: () => [...queryKeys.vendor.all, 'paymentMethods'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    byCustomer: (customerId: string) => [...queryKeys.reviews.all, 'customer', customerId] as const,
  },
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    messages: (conversationId: string) => [...queryKeys.chat.all, 'messages', conversationId] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.bookings.all, 'list', page, limit] as const,
    detail: (bookingId: string) => [...queryKeys.bookings.all, 'detail', bookingId] as const,
  },
  quotes: {
    all: ['quotes'] as const,
    vendorList: (page: number, limit: number, filters?: Record<string, unknown>) => 
      [...queryKeys.quotes.all, 'vendorList', page, limit, filters] as const,
    customerList: (page?: number, limit?: number, filters?: Record<string, unknown>) =>
      [...queryKeys.quotes.all, 'customerList', page, limit, filters] as const,
  },
  quoteRequests: {
    all: ['quoteRequests'] as const,
    vendorList: (page?: number, limit?: number, filters?: Record<string, unknown>) =>
      [...queryKeys.quoteRequests.all, 'vendorList', page, limit, filters] as const,
    customerList: (page?: number, limit?: number, filters?: Record<string, unknown>) =>
      [...queryKeys.quoteRequests.all, 'customerList', page, limit, filters] as const,
  },
};
