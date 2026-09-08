import { ControlTower } from "@/components/control-tower";
import { communications, documents, exceptions, shipments } from "@/lib/demo-data";

export default function Home() {
  return <ControlTower shipments={shipments} exceptions={exceptions} communications={communications} documents={documents} />;
}
