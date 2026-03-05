import type { VendorServiceTag, VendorSpecialty } from "../_data/types";

interface VendorServicesProps {
  vendorServices?: VendorServiceTag[];
  vendorSpecialties?: VendorSpecialty[];
}

export function VendorServices({
  vendorServices,
  vendorSpecialties,
}: VendorServicesProps) {
  // Extract category name from the first service entry
  const categoryName = vendorServices?.[0]?.serviceCategory?.name ?? null;

  // Extract tags from all service entries
  const tags = vendorServices?.flatMap((s) => s.tags ?? []) ?? [];

  // Extract specialty names from all specialty entries
  const specialtyNames =
    vendorSpecialties?.map((s) => s.serviceSpecialty?.name).filter(Boolean) ?? [];

  // Combine: Category first, then specialties, then tags — deduplicated
  const displayServices: string[] = [];

  if (categoryName) displayServices.push(categoryName);

  for (const name of specialtyNames) {
    if (name && !displayServices.includes(name)) displayServices.push(name);
  }

  for (const tag of tags) {
    if (tag && !displayServices.includes(tag)) displayServices.push(tag);
  }

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
