import { ServicesBoard } from "./_components/services-board";
import { checkPageAccess } from "@/lib/actions/staff";
import { NotAuthorized } from "@/components/vendor/NotAuthorized";

export default async function VendorServicesPage() {
  const { allowed } = await checkPageAccess("manage_services", "read");
  if (!allowed) return <NotAuthorized module="manage_services" />;

  return <ServicesBoard />;
}

