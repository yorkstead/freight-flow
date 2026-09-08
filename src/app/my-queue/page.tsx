import { MyQueue } from "@/components/my-queue";
import { exceptions, shipments } from "@/lib/demo-data";

export default function MyQueuePage() {
  return <MyQueue exceptions={exceptions} shipments={shipments} />;
}
