import { quoteRequests } from "./data";
import { RequestsDashboard } from "./_components/requests-dashboard";

export default function VendorRequestsPage() {
  return <RequestsDashboard requests={quoteRequests} />;
}
