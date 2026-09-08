import { CarrierList } from "@/components/carrier-list";
import { carriers, exceptions, shipments } from "@/lib/demo-data";

export default function CarriersPage() {
  return <CarrierList carriers={carriers} shipments={shipments} exceptions={exceptions} />;
}
