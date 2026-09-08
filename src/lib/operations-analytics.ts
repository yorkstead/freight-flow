import type { Carrier, CommunicationEvent, Document, Exception, Shipment } from "@/lib/domain";

export function operationsAnalytics(
  shipments: Shipment[],
  exceptions: Exception[],
  communications: CommunicationEvent[],
  documents: Document[],
  carriers: Carrier[],
) {
  const active = shipments.filter((shipment) => !["closed", "invoiced"].includes(shipment.currentStatus));
  const loadsWithExceptions = new Set(exceptions.filter((exception) => exception.status !== "resolved").map((exception) => exception.shipmentId));
  const interventionContacts = communications.filter((event) => event.direction === "outbound").length;
  const blocked = shipments.filter((shipment) => shipment.podStatus === "missing" || shipment.billingStatus === "held");
  const lanes = Array.from(new Set(shipments.map((shipment) => `${shipment.origin} → ${shipment.destination}`))).map((lane) => {
    const loads = shipments.filter((shipment) => `${shipment.origin} → ${shipment.destination}` === lane);
    const laneExceptions = exceptions.filter((exception) => loads.some((load) => load.id === exception.shipmentId));
    return { lane, loads, exceptions: laneExceptions.length, late: loads.filter((load) => new Date(load.eta) > new Date(load.deliveryAppointment)).length, tracking: loads.filter((load) => load.trackingState !== "current").length };
  }).sort((a, b) => b.exceptions - a.exceptions).slice(0, 6);
  const customerRows = Array.from(new Set(shipments.map((shipment) => shipment.customer.id))).map((id) => {
    const loads = shipments.filter((shipment) => shipment.customer.id === id);
    const customerExceptions = exceptions.filter((exception) => loads.some((load) => load.id === exception.shipmentId));
    return { customer: loads[0].customer, loads, exceptions: customerExceptions.length, manual: communications.filter((event) => !event.automated && loads.some((load) => load.id === event.shipmentId)).length, detention: loads.filter((_, index) => index % 4 === 0).length, accessorial: loads.filter((_, index) => index % 3 === 0).length };
  });
  return {
    loadHealth: { total: shipments.length, intervention: loadsWithExceptions.size, exceptionFree: shipments.length - loadsWithExceptions.size, exceptionRate: Math.round((loadsWithExceptions.size / shipments.length) * 100), averageExceptions: (exceptions.length / shipments.length).toFixed(1) },
    dispatch: { contactsPerLoad: (interventionContacts / shipments.length).toFixed(1), interventionsPerLoad: (loadsWithExceptions.size / shipments.length).toFixed(1), resolutionHours: 6 + (exceptions.length % 7), queueAging: Math.round(exceptions.reduce((sum, exception) => sum + (exception.severity === "critical" ? 9 : 4), 0) / Math.max(1, exceptions.length)), callsAvoided: Math.round(active.length * 0.35) },
    carrierRows: carriers.slice(0, 8),
    customerRows,
    lanes,
    documents: { deliveredToPod: 18, deliveredToBilling: 31, blockedRevenue: blocked.reduce((sum, shipment) => sum + shipment.revenue, 0), overdue: blocked.length },
    financial: { serviceRisk: loadsWithExceptions.size, accessorialExposure: Math.round(shipments.filter((_, index) => index % 5 === 0).reduce((sum, shipment) => sum + shipment.revenue * 0.08, 0)), laborHours: Math.round(interventionContacts * 0.25) },
  };
}
