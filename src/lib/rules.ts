import type { Exception, Shipment } from "@/lib/domain";

const severityWeight = { critical: 100, high: 70, medium: 40, low: 20 } as const;

export interface PriorityBreakdown {
  score: number;
  factors: { label: string; points: number; detail: string }[];
}

const hoursUntil = (date: string) => (new Date(date).getTime() - Date.now()) / 3_600_000;
const hoursSince = (date: string) => (Date.now() - new Date(date).getTime()) / 3_600_000;

export function priorityBreakdown(exception: Exception, shipment: Shipment): PriorityBreakdown {
  const appointment = shipment.currentStatus.includes("pickup")
    ? shipment.pickupAppointment
    : shipment.deliveryAppointment;
  const appointmentHours = hoursUntil(appointment);
  const etaLate = new Date(shipment.eta).getTime() > new Date(shipment.deliveryAppointment).getTime();
  const trackingHours = hoursSince(shipment.lastTrackingUpdate);
  const contactHours = hoursSince(shipment.lastCarrierContact);
  const updateHours = hoursUntil(shipment.customerUpdateDue);
  const exceptionAge = hoursSince(exception.detectedAt);
  const factors = [
    { label: "Severity", points: severityWeight[exception.severity], detail: `${exception.severity} exception` },
    { label: "Appointment proximity", points: appointmentHours < 0 ? 35 : appointmentHours < 2 ? 24 : appointmentHours < 6 ? 12 : 0, detail: appointmentHours < 0 ? "appointment is overdue" : `${Math.max(0, Math.round(appointmentHours))}h to appointment` },
    { label: "Projected lateness", points: etaLate ? 22 : 0, detail: etaLate ? "ETA is past delivery appointment" : "ETA is within appointment" },
    { label: "Tracking freshness", points: trackingHours >= 4 ? 20 : trackingHours >= 2 ? 10 : 0, detail: `${Math.max(1, Math.round(trackingHours))}h since tracking ping` },
    { label: "Carrier contact", points: contactHours >= 4 ? 15 : contactHours >= 2 ? 8 : 0, detail: `${Math.max(1, Math.round(contactHours))}h since carrier contact` },
    { label: "Customer SLA", points: updateHours < 0 ? 18 : updateHours < 2 ? 12 : shipment.customer.slaHours <= 2 ? 6 : 0, detail: updateHours < 0 ? "customer update overdue" : `${Math.max(0, Math.round(updateHours))}h to update deadline` },
    { label: "Critical documents", points: shipment.podStatus === "missing" || shipment.bolStatus === "missing" ? 10 : 0, detail: shipment.podStatus === "missing" || shipment.bolStatus === "missing" ? "POD or BOL missing" : "documents current" },
    { label: "Carrier reliability", points: shipment.carrier.score < 90 ? 8 : 0, detail: `carrier score ${shipment.carrier.score}` },
    { label: "Exception age", points: exceptionAge >= 12 ? 12 : exceptionAge >= 4 ? 6 : 0, detail: `${Math.max(1, Math.round(exceptionAge))}h unresolved` },
  ].filter((factor) => factor.points > 0);
  return { score: factors.reduce((total, factor) => total + factor.points, 0), factors };
}

export function priorityScore(exception: Exception, shipment: Shipment): number {
  return priorityBreakdown(exception, shipment).score;
}

export function prioritizedExceptions(exceptions: Exception[], shipments: Shipment[]) {
  const shipmentById = new Map(shipments.map((shipment) => [shipment.id, shipment]));
  return exceptions
    .filter((exception) => exception.status !== "resolved")
    .map((exception) => {
      const shipment = shipmentById.get(exception.shipmentId);
      if (!shipment) return { exception, shipment: undefined, score: 0, breakdown: { score: 0, factors: [] } };
      const breakdown = priorityBreakdown(exception, shipment);
      return { exception, shipment, score: breakdown.score, breakdown };
    })
    .sort((a, b) => b.score - a.score);
}
