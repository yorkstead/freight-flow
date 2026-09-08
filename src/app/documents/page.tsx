import { DocumentQueue } from "@/components/document-queue";
import { documents, shipments } from "@/lib/demo-data";

export default function DocumentsPage() {
  return <DocumentQueue shipments={shipments} documents={documents} />;
}
