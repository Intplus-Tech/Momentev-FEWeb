import { useQuery } from '@tanstack/react-query';
import { getAddress } from '@/lib/actions/address';
import { queryKeys } from '@/lib/react-query/keys';
import { useUserProfile } from '@/hooks/api/use-user-profile';

function resolveAddressId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    return id ? String(id) : null;
  }
  return null;
}

/**
 * Resolve the authenticated user's effective address:
 * - Vendor users: business-profile contact address (when present)
 * - Otherwise: trusted User.addressId (customer / self)
 */
export function useUserAddress() {
  const { data: user } = useUserProfile();

  const businessAddress = user?.vendor?.businessProfile?.contactInfo?.addressId;
  const businessAddressId = resolveAddressId(businessAddress);
  const userAddressId = resolveAddressId(user?.addressId);

  const resolvedAddress = businessAddressId ? businessAddress : user?.addressId;
  const addressId = businessAddressId ?? userAddressId;
  const source = businessAddressId ? 'business' : userAddressId ? 'user' : null;

  return useQuery({
    queryKey: queryKeys.address.detail(addressId as string),
    queryFn: async () => {
      if (!addressId) {
        return { address: null, source: null };
      }

      const result = await getAddress(addressId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch address');
      }

      return { address: result.data || null, source };
    },
    enabled: !!addressId,
    initialData:
      typeof resolvedAddress === 'object' && resolvedAddress !== null
        ? { address: resolvedAddress, source }
        : undefined,
    retry: 1,
    staleTime: 1 * 60 * 1000,
  });
}
