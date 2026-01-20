import { useQuery } from '@tanstack/react-query';
import { getAddress } from '@/lib/actions/address';
import { queryKeys } from '@/lib/react-query/keys';
import { useUserProfile } from './use-user-profile';

export function useUserAddress() {
  const { data: user } = useUserProfile();
  const addressId = user?.addressId;

  return useQuery({
    queryKey: queryKeys.address.detail(addressId as string),
    queryFn: async () => {
      if (!addressId) {
        return null;
      }

      const result = await getAddress(addressId as string);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch address');
      }

      return result.data || null;
    },
    enabled: !!addressId, // Only fetch if addressId exists
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider address data fresh for 5 minutes
  });
}
