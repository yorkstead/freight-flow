import { ExecutiveCockpit } from "@/components/executive-cockpit";
import { communications, exceptions, shipments } from "@/lib/demo-data";
import { executiveMetrics } from "@/lib/executive-metrics";

export default function ExecutivePage() {
  return <ExecutiveCockpit data={executiveMetrics(shipments, exceptions, communications)} />;
}
