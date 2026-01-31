"use client";

import { useVendorSpecialties } from "@/lib/react-query/hooks/use-vendor-specialties";
import { useServiceSpecialtiesNames } from "@/lib/react-query/hooks/use-service-specialties";

interface VendorServicesProps {
  vendorId: string;
  fallbackServices?: string[];
}

export function VendorServices({
  vendorId,
  fallbackServices,
}: VendorServicesProps) {
  // 1. Fetch vendor specialties (IDs)
  const { data: vendorSpecialtiesData, isLoading: isLoadingVendorSpecialties } =
    useVendorSpecialties({
      page: 1,
      limit: 20, // Reasonable limit for card display
      vendorId: vendorId,
    });

  const specialtyIds =
    vendorSpecialtiesData?.data?.data?.map((vs) => vs.serviceSpecialty) || [];

  // 2. Fetch names for these IDs
  const specialtyQueries = useServiceSpecialtiesNames(specialtyIds);

  // Collect names
  const resolvedNames = specialtyQueries
    .map((q) => q.data)
    .filter((name): name is string => !!name);

  // If loading, or empty, decide what to show
  const showResolved = resolvedNames.length > 0;

  const displayServices = showResolved ? resolvedNames : fallbackServices || [];

  if (displayServices.length === 0) return null;

  return (
    <div className="hidden lg:block min-w-[200px]">
      <p className="font-medium text-sm mb-2">Services</p>
      <ul className="space-y-1">
        {displayServices.slice(0, 5).map((service, index) => (
          <li
            key={index}
            className="text-xs text-muted-foreground flex items-center gap-1.5"
          >
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            {service}
          </li>
        ))}
        {displayServices.length > 5 && (
          <li className="text-xs text-muted-foreground pl-2.5">
            +{displayServices.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
}
