import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/actions/user';
import { queryKeys } from '@/lib/react-query/keys';

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const result = await getUserProfile();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile');
      }

      // Return null for unauthenticated state (valid, not an error)
      if (!result.data) {
        return null;
      }

      return result.data;
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors (unauthenticated/unauthorized)
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Not authenticated') || message.includes('Session expired')) {
        return false;
      }
      // Allow 1 retry on network/server errors
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // Consider profile data fresh for 5 minutes
  });
}
