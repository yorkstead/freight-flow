import { notFound } from "next/navigation";
import { CarrierDetail } from "@/components/carrier-detail";
import { carriers, communications, documents, exceptions, shipments } from "@/lib/demo-data";

export function generateStaticParams() {
  return carriers.map((carrier) => ({ id: carrier.id }));
}

export default async function CarrierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carrier = carriers.find((item) => item.id === id);
  if (!carrier) notFound();
  return <CarrierDetail carrier={carrier} shipments={shipments} exceptions={exceptions} communications={communications} documents={documents} />;
}
