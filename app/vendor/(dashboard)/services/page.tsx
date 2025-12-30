import { services } from "./data";
import { ServicesBoard } from "./_components/services-board";

export default function VendorServicesPage() {
  return <ServicesBoard services={services} />;
}
