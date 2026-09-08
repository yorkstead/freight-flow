import { notFound } from "next/navigation";
import { LoadDetail } from "@/components/load-detail";
import { communications, documents, exceptions, shipments, timelineEvents } from "@/lib/demo-data";

export function generateStaticParams() {
  return shipments.map((shipment) => ({ id: shipment.id }));
}

export default async function LoadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = shipments.find((item) => item.id === id);
  if (!shipment) notFound();

  return (
    <LoadDetail
      shipment={shipment}
      exceptions={exceptions.filter((item) => item.shipmentId === shipment.id)}
      communications={communications.filter((item) => item.shipmentId === shipment.id)}
      documents={documents.filter((item) => item.shipmentId === shipment.id)}
      timeline={timelineEvents.filter((item) => item.shipmentId === shipment.id)}
    />
  );
}
