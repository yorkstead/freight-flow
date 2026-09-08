import { CustomerCommunications } from "@/components/customer-communications";
import { communications, customers, exceptions, shipments } from "@/lib/demo-data";

export default function CustomerUpdatesPage() {
  return <CustomerCommunications communications={communications} customers={customers} exceptions={exceptions} shipments={shipments} />;
}
