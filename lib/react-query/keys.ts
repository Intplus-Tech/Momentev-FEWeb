/**
 * Query Keys Factory
 * 
 * Use this file to define query keys for your application.
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
};
