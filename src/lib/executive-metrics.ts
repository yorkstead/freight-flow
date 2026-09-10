import { DEMO_NOW } from "@/lib/demo-clock";
import type { CommunicationEvent, Exception, Shipment } from "@/lib/domain";

export function executiveMetrics(shipments: Shipment[], exceptions: Exception[], communications: CommunicationEvent[]) {
  const active = shipments.filter((shipment) => shipment.currentStatus !== "closed");
  const openExceptions = exceptions.filter((exception) => exception.status !== "resolved");
  const interventionLoads = new Set(openExceptions.map((exception) => exception.shipmentId));
  const delivered = shipments.filter((shipment) => ["delivered", "pod_pending"].includes(shipment.currentStatus));
  const billingReady = shipments.filter((shipment) => shipment.billingStatus === "ready");
  const revenue = (loads: Shipment[]) => loads.reduce((sum, shipment) => sum + shipment.revenue, 0);
  const byDispatcher = Array.from(new Set(openExceptions.map((exception) => exception.owner))).map((owner) => ({
    owner,
    count: openExceptions.filter((exception) => exception.owner === owner).length,
  })).sort((a, b) => b.count - a.count);
  const carrierIssues = Array.from(new Set(openExceptions.filter((exception) => exception.category === "carrier").map((exception) => exception.shipmentId))).length;
  const upcomingRisk = active.filter((shipment) => new Date(shipment.eta) > new Date(shipment.deliveryAppointment)).length;
  const autoUpdates = communications.filter((event) => event.type === "customer_update" && event.automated).length;
  const bottlenecks = [
    `${delivered.filter((shipment) => shipment.podStatus === "missing").length} loads are waiting on POD from ${new Set(delivered.filter((shipment) => shipment.podStatus === "missing").map((shipment) => shipment.carrier.id)).size} carriers.`,
    `${byDispatcher[0]?.owner ?? "No dispatcher"} owns ${Math.round(((byDispatcher[0]?.count ?? 0) / Math.max(1, openExceptions.length)) * 100)}% of today's unresolved exceptions.`,
    `${upcomingRisk} loads have ETA after their delivery appointment across ${new Set(active.filter((shipment) => new Date(shipment.eta) > new Date(shipment.deliveryAppointment)).map((shipment) => `${shipment.origin} → ${shipment.destination}`)).size} lanes.`,
    `${carrierIssues} loads have generated communication exceptions requiring carrier follow-up.`,
  ];
  return {
    today: { active: active.length, pickups: active.filter((shipment) => !["loaded", "in_transit", "at_delivery", "delivered", "pod_pending"].includes(shipment.currentStatus)).length, deliveries: active.filter((shipment) => ["in_transit", "loaded", "at_delivery"].includes(shipment.currentStatus)).length, critical: openExceptions.filter((exception) => exception.severity === "critical").length, escalations: openExceptions.filter((exception) => exception.category === "service" || exception.severity === "critical").length, inTransitRevenue: revenue(active.filter((shipment) => ["in_transit", "loaded", "at_delivery"].includes(shipment.currentStatus))), awaitingPod: revenue(shipments.filter((shipment) => shipment.podStatus === "missing" && delivered.includes(shipment))), billingReady: revenue(billingReady) },
    pressure: { critical: openExceptions.filter((exception) => exception.severity === "critical").length, high: openExceptions.filter((exception) => exception.severity === "high").length, medium: openExceptions.filter((exception) => exception.severity === "medium").length, low: openExceptions.filter((exception) => exception.severity === "low").length, queueAge: Math.round(openExceptions.reduce((sum, exception) => sum + Math.max(1, (DEMO_NOW - new Date(exception.detectedAt).getTime()) / 3_600_000), 0) / Math.max(1, openExceptions.length)), workload: byDispatcher, carrierIssues, upcomingRisk },
    effectiveness: { handledWithoutManual: Math.round(((shipments.length - interventionLoads.size) / shipments.length) * 100), interventionsPer100: Math.round((interventionLoads.size / shipments.length) * 100), trackingCoverage: Math.round((shipments.filter((shipment) => shipment.trackingState === "current").length / shipments.length) * 100), automatedUpdates: autoUpdates, resolutionHours: 6 + (openExceptions.length % 7) },
    bottlenecks,
  };
}
