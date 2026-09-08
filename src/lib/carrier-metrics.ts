import type { Carrier, CommunicationEvent, Document, Exception, Shipment } from "@/lib/domain";

export interface CarrierMetrics {
  carrier: Carrier;
  loads: Shipment[];
  exceptions: Exception[];
  activeLoads: number;
  recentIssues: string[];
  noIntervention: number;
  dispatcherFollowUp: number;
  customerEscalations: number;
  interventionContacts: number;
  lanes: { lane: string; loads: number; onTime: number }[];
  history: { period: string; pickup: number; delivery: number; tracking: number }[];
}

export function carrierMetrics(
  carrier: Carrier,
  shipments: Shipment[],
  exceptions: Exception[],
  communications: CommunicationEvent[] = [],
  documents: Document[] = [],
): CarrierMetrics {
  const loads = shipments.filter((shipment) => shipment.carrier.id === carrier.id);
  const carrierExceptions = exceptions.filter((exception) => loads.some((load) => load.id === exception.shipmentId));
  const followUp = carrierExceptions.length;
  const escalations = carrierExceptions.filter((exception) => exception.severity === "critical" || exception.category === "carrier").length;
  const contacts = communications.filter((event) => loads.some((load) => load.id === event.shipmentId) && event.direction === "outbound").length;
  const missingDocs = documents.filter((document) => loads.some((load) => load.id === document.shipmentId) && document.status === "missing").length;
  const lanes = Array.from(new Set(loads.map((load) => `${load.origin} → ${load.destination}`))).slice(0, 4).map((lane, index) => ({
    lane,
    loads: 1 + ((loads.length + index) % 4),
    onTime: Math.max(72, carrier.onTimeDeliveryRate - index * 3),
  }));
  return {
    carrier,
    loads,
    exceptions: carrierExceptions,
    activeLoads: loads.filter((load) => !["delivered", "closed", "invoiced"].includes(load.currentStatus)).length,
    recentIssues: [
      ...(carrier.averageResponseTime > 24 ? ["Slow carrier response after dispatch"] : []),
      ...(carrier.trackingCompliance < 90 ? ["Missed tracking checkpoints"] : []),
      ...(carrier.onTimePickupRate < 92 ? ["Repeated late pickup risk"] : []),
      ...(carrier.podTurnaround > 24 ? ["POD delivery is slower than target"] : []),
      ...(missingDocs > 0 ? [`${missingDocs} document${missingDocs === 1 ? "" : "s"} missing`] : []),
    ].slice(0, 4),
    noIntervention: Math.max(0, loads.length - followUp),
    dispatcherFollowUp: followUp,
    customerEscalations: escalations,
    interventionContacts: contacts,
    lanes,
    history: [
      { period: "Apr", pickup: Math.max(72, carrier.onTimePickupRate - 4), delivery: Math.max(70, carrier.onTimeDeliveryRate - 3), tracking: Math.max(75, carrier.trackingCompliance - 5) },
      { period: "May", pickup: Math.max(74, carrier.onTimePickupRate - 2), delivery: Math.max(72, carrier.onTimeDeliveryRate - 1), tracking: Math.max(78, carrier.trackingCompliance - 2) },
      { period: "Jun", pickup: carrier.onTimePickupRate, delivery: carrier.onTimeDeliveryRate, tracking: carrier.trackingCompliance },
    ],
  };
}
