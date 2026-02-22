import { useQuery } from '@tanstack/react-query';
import { getVendorServicesAction, getVendorSpecialtiesAction } from '@/app/(home)/search/_data/actions';
import { useUserProfile } from '@/hooks/api/use-user-profile';
import { queryKeys } from '@/lib/react-query/keys';

export function useVendorServices() {
  const { data: userProfile, isLoading: isProfileLoading, isError: isProfileError } = useUserProfile();

  // As per your User profile structure, vendor id is often found here
  const vendorId = userProfile?.vendor?._id;

  const servicesQuery = useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getVendorServicesAction(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const specialtiesQuery = useQuery({
    queryKey: ['vendor-specialties', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getVendorSpecialtiesAction(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    vendorId,
    services: servicesQuery.data?.data?.data || [],
    specialties: specialtiesQuery.data?.data?.data || [],
    isLoading: isProfileLoading || servicesQuery.isLoading || specialtiesQuery.isLoading,
    isError: isProfileError || servicesQuery.isError || specialtiesQuery.isError,

    // Quick helpers to refresh
    refetchServices: servicesQuery.refetch,
    refetchSpecialties: specialtiesQuery.refetch,
  };
}
