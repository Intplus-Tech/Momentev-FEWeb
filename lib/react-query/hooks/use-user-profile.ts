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

      if (!result.data) {
        throw new Error('No user data returned');
      }

      return result.data;
    },
    retry: 1, // Don't retry too many times for auth errors
    staleTime: 1 * 60 * 1000, // Consider profile data fresh for 5 minutes
  });
}
