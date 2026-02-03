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
};
