import { RequestsDashboard } from "./_components/requests-dashboard";
import { checkPageAccess } from "@/lib/actions/staff";
import { NotAuthorized } from "@/components/vendor/NotAuthorized";

export default async function VendorRequestsPage() {
  const { allowed } = await checkPageAccess("view_orders", "read");
  if (!allowed) return <NotAuthorized module="view_orders" />;

  return <RequestsDashboard />;
}

