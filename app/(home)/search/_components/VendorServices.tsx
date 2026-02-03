"use client";

import { useVendorServices, useVendorSpecialties } from "../_data/hooks";

interface VendorServicesProps {
  vendorId: string;
  fallbackServices?: string[];
}

export function VendorServices({
  vendorId,
  fallbackServices,
}: VendorServicesProps) {
  // Fetch vendor services (category, tags)
  const { data: servicesData, isLoading: isLoadingServices } =
    useVendorServices(vendorId);

  // Fetch vendor specialties (name, price)
  const { data: specialtiesData, isLoading: isLoadingSpecialties } =
    useVendorSpecialties(vendorId);

  // Extract category name
  const categoryName =
    servicesData?.data?.data?.[0]?.serviceCategory?.name || null;

  // Extract tags
  const tags = servicesData?.data?.data?.[0]?.tags || [];

  // Extract specialty names
  const specialtyNames =
    specialtiesData?.data?.data?.map((s) => s.serviceSpecialty?.name) || [];

  // Combine: Category first, then specialties, then tags
  const displayServices: string[] = [];

  if (categoryName) {
    displayServices.push(categoryName);
  }

  specialtyNames.forEach((name) => {
    if (name && !displayServices.includes(name)) {
      displayServices.push(name);
    }
  });

  tags.forEach((tag) => {
    if (tag && !displayServices.includes(tag)) {
      displayServices.push(tag);
    }
  });

  // Fallback to prop if no data
  const finalServices =
    displayServices.length > 0 ? displayServices : fallbackServices || [];

  if (finalServices.length === 0) return null;

  return (
    <div className="hidden lg:block min-w-[200px]">
      <p className="font-medium text-sm mb-2">Services</p>
      <ul className="space-y-1">
        {finalServices.slice(0, 5).map((service, index) => (
          <li
            key={index}
            className="text-xs text-muted-foreground flex items-center gap-1.5"
          >
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            {service}
          </li>
        ))}
        {finalServices.length > 5 && (
          <li className="text-xs text-muted-foreground pl-2.5">
            +{finalServices.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
}
