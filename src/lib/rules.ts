import type { Exception, Shipment } from "@/lib/domain";

const severityWeight = { critical: 100, high: 70, medium: 40, low: 20 } as const;

export function priorityScore(exception: Exception, shipment: Shipment): number {
  const dueInHours = (new Date(exception.dueAt).getTime() - Date.now()) / 3_600_000;
  const urgency = dueInHours < 0 ? 35 : dueInHours < 2 ? 22 : dueInHours < 6 ? 10 : 0;
  const tracking = shipment.trackingState === "stale" ? 15 : 0;
  const customerSla = shipment.customer.slaHours <= 2 ? 8 : 0;
  return severityWeight[exception.severity] + urgency + tracking + customerSla;
}

export function prioritizedExceptions(exceptions: Exception[], shipments: Shipment[]) {
  const shipmentById = new Map(shipments.map((shipment) => [shipment.id, shipment]));
  return exceptions
    .filter((exception) => exception.status !== "resolved")
    .map((exception) => {
      const shipment = shipmentById.get(exception.shipmentId);
      if (!shipment) return { exception, shipment: undefined, score: 0 };
      return { exception, shipment, score: priorityScore(exception, shipment) };
    })
    .sort((a, b) => b.score - a.score);
}

