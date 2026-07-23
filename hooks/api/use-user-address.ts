import { useQuery } from '@tanstack/react-query';
import { getAddress } from '@/lib/actions/address';
import { queryKeys } from '@/lib/react-query/keys';
import { useUserProfile } from '@/hooks/api/use-user-profile';

export function useUserAddress() {
  const { data: user } = useUserProfile();

  // Use the vendor business-profile address as the single source of truth.
  // The API might return a populated Address object OR just a string ID.
  // @ts-ignore - businessProfile is typed as any or we need to be safe
  const resolvedAddress = user?.vendor?.businessProfile?.contactInfo?.addressId;

  // Extract ID if it's an object, or use the string directly
  // Extract ID if it's an object, or use the string directly
  const addressId = typeof resolvedAddress === 'object' && resolvedAddress !== null
    ? resolvedAddress._id
    : resolvedAddress;

  const source = resolvedAddress ? 'business' : null;

  return useQuery({
    queryKey: queryKeys.address.detail(addressId as string),
    queryFn: async () => {
      if (!addressId) {
        return { address: null, source: null };
      }

      const result = await getAddress(addressId as string);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch address');
      }

      return { address: result.data || null, source };
    },
    enabled: !!addressId,
    // If we already have the populated address object from the profile, use it as initial data
    initialData: typeof resolvedAddress === 'object' && resolvedAddress !== null
      ? { address: resolvedAddress, source }
      : undefined,
    retry: 1,
    staleTime: 1 * 60 * 1000,
  });
}
