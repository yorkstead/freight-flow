import { OperationsAnalytics } from "@/components/operations-analytics";
import { carriers, communications, documents, exceptions, shipments } from "@/lib/demo-data";
import { operationsAnalytics } from "@/lib/operations-analytics";

export default function AnalyticsPage() {
  return <OperationsAnalytics data={operationsAnalytics(shipments, exceptions, communications, documents, carriers)} shipments={shipments} />;
}
