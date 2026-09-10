import { DEMO_NOW } from "@/lib/demo-clock";
import type {
  Carrier,
  CommunicationEvent,
  Customer,
  Document,
  Exception,
  Person,
  Shipment,
  TimelineEvent,
} from "@/lib/domain";

const names = [
  "Maya Chen",
  "Jordan Brooks",
  "Elena Rodriguez",
  "Marcus Hill",
  "Tessa Morgan",
  "Avery Patel",
  "Nolan Reed",
  "Priya Shah",
] as const;

const cities = [
  ["Dallas, TX", "Atlanta, GA"],
  ["Joliet, IL", "Columbus, OH"],
  ["Savannah, GA", "Charlotte, NC"],
  ["Reno, NV", "Phoenix, AZ"],
  ["Stockton, CA", "Denver, CO"],
  ["Harrisburg, PA", "Newark, NJ"],
  ["Memphis, TN", "Nashville, TN"],
  ["Kansas City, MO", "Omaha, NE"],
] as const;

const carrierNames = [
  "Blue Mesa Freight",
  "Ironwood Transport",
  "Canyon State Logistics",
  "Northstar Haulage",
  "Pioneer Linehaul",
  "Red Cedar Carriers",
  "Summit Ridge Trucking",
  "Prairie Fox Logistics",
  "Atlas Creek Transport",
  "Silver Oak Freight",
  "Granite Peak Carriers",
  "Copper Trail Express",
  "Evergreen Relay",
  "Horizon Mile Logistics",
  "Frontier Cartage",
  "Oakline Transport",
  "Clearpath Freight",
  "Highland Route Co.",
  "Westward Haul",
  "Lakeside Carrier Group",
] as const;

const customerNames = [
  "Harbor & Pine Home Goods",
  "Northline Industrial",
  "Vantage Retail Group",
  "Cedar Grove Foods",
  "Meridian Medical Supply",
  "Brightwell Manufacturing",
  "Atlas Outdoor Living",
  "Redwood Office Products",
  "Summit Appliance Co.",
  "Juniper Pet Nutrition",
] as const;

const isoHoursAgo = (hours: number) =>
  new Date(DEMO_NOW - hours * 60 * 60 * 1000).toISOString();
const isoHoursFromNow = (hours: number) =>
  new Date(DEMO_NOW + hours * 60 * 60 * 1000).toISOString();

export const dispatchers: Person[] = names.slice(0, 5).map((name, index) => ({
  id: `dispatcher-${index + 1}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@freightflow.demo`,
  phone: `(555) 014-${String(1200 + index).slice(-4)}`,
}));

export const brokers: Person[] = names.slice(3).map((name, index) => ({
  id: `broker-${index + 1}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@freightflow.demo`,
  phone: `(555) 015-${String(2200 + index).slice(-4)}`,
}));

export const customers: Customer[] = customerNames.map((name, index) => ({
  id: `customer-${index + 1}`,
  name,
  accountCode: `AC-${String(410 + index)}`,
  slaHours: index % 3 === 0 ? 2 : 4,
  activeLoads: 3 + (index % 7),
}));

export const carriers: Carrier[] = carrierNames.map((name, index) => {
  const pickup = 88 + (index % 9);
  const delivery = 86 + ((index * 3) % 12);
  return {
    id: `carrier-${index + 1}`,
    name,
    mcNumber: `MC-${String(440000 + index * 137)}`,
    dotNumber: `DOT-${String(1800000 + index * 211)}`,
    contact: names[index % names.length],
    activeLoads: 1 + (index % 5),
    onTimePickupRate: pickup,
    onTimeDeliveryRate: delivery,
    averageResponseTime: 8 + ((index * 7) % 28),
    trackingCompliance: 84 + ((index * 5) % 15),
    exceptionRate: 2 + (index % 8),
    podTurnaround: 10 + ((index * 2) % 20),
    score: Math.round((pickup + delivery - index % 7) / 2),
  };
});

const statusByIndex = [
  "in_transit",
  "in_transit",
  "en_route_pickup",
  "at_pickup",
  "loaded",
  "at_delivery",
  "delivered",
  "pod_pending",
] as const;

export const shipments: Shipment[] = Array.from({ length: 80 }, (_, index) => {
  const route = cities[index % cities.length];
  const carrier = carriers[index % carriers.length];
  const customer = customers[index % customers.length];
  const status = statusByIndex[index % statusByIndex.length];
  const isCompleted = status === "delivered" || status === "pod_pending";
  const isPrePickup = status === "en_route_pickup" || status === "at_pickup";
  const pickupOffset = isCompleted ? -36 - (index % 18) : isPrePickup ? (index % 8) - 2 : -8 - (index % 10);
  const deliveryOffset = isCompleted ? -12 - (index % 24) : 8 + (index % 28);
  const riskReasons =
    !isCompleted && index % 7 === 0
      ? ["Tracking stale", "Customer update due"]
      : !isCompleted && index % 5 === 0
        ? ["Appointment proximity"]
        : [];
  const podStatus =
    status === "pod_pending" ? "missing" : status === "delivered" ? "verified" : "missing";
  const bolStatus = index % 11 === 0 ? "missing" : "verified";
  return {
    id: `shipment-${index + 1}`,
    loadNumber: `FF-${String(24000 + index)}`,
    sourceSystem: "TMS",
    sourceRecordId: `TMS-${String(24000 + index)}`,
    customer,
    broker: brokers[index % brokers.length],
    dispatcher: dispatchers[index % dispatchers.length],
    origin: route[0],
    destination: route[1],
    pickupAppointment: isoHoursFromNow(pickupOffset),
    deliveryAppointment: isoHoursFromNow(deliveryOffset),
    currentStatus: status,
    carrier,
    driverName: names[(index + 2) % names.length],
    driverPhone: `(555) 016-${String(3100 + index).slice(-4)}`,
    equipmentType: index % 4 === 0 ? "Reefer" : index % 5 === 0 ? "Flatbed" : "Dry van",
    rate: 1200 + (index % 9) * 175,
    revenue: 1500 + (index % 9) * 210,
    estimatedMargin: 210 + (index % 8) * 42,
    lastCarrierContact: isoHoursAgo((index % 9) + 1),
    lastTrackingUpdate: isoHoursAgo(index % 7 === 0 ? 3 + (index % 4) : index % 3),
    eta: isoHoursFromNow((index % 22) + 2),
    trackingState: index % 7 === 0 ? "stale" : "current",
    customerUpdateDue: isoHoursFromNow(isCompleted ? 24 : index % 6 === 0 ? -1 : 3),
    podStatus,
    bolStatus,
    billingStatus:
      status === "delivered" && podStatus === "verified" && bolStatus === "verified"
        ? "ready"
        : status === "pod_pending" || status === "delivered"
          ? "held"
          : "not_ready",
    riskScore: riskReasons.length ? 58 + (index % 35) : 12 + (index % 30),
    riskReasons,
    tags: [index % 2 === 0 ? "priority-customer" : "standard", ...(index % 7 === 0 ? ["stale-tracking"] : [])],
  };
});

const exceptionTemplates = [
  ["Stale tracking", "tracking", "Tracking has not updated within the operating threshold.", "Contact carrier and request a location ping.", "high"],
  ["Pickup appointment risk", "appointment", "Projected arrival is inside the pickup appointment buffer.", "Confirm appointment and notify the customer if ETA slips.", "high"],
  ["Carrier non-response", "carrier", "Carrier has not acknowledged the last two outreach attempts.", "Escalate to carrier relations for a live contact.", "critical"],
  ["POD missing", "documentation", "Delivered shipment has no verified proof of delivery.", "Request POD from the driver before billing cutoff.", "medium"],
  ["Customer update overdue", "service", "Customer-facing update missed its service-level deadline.", "Send a concise status update with the next checkpoint.", "high"],
  ["BOL missing", "documentation", "Bill of lading is not attached to the shipment record.", "Request BOL from the origin contact.", "medium"],
  ["Delivery appointment risk", "appointment", "Current ETA is trending past the delivery appointment.", "Re-plan the delivery appointment with the consignee.", "critical"],
] as const;

export const exceptions: Exception[] = Array.from({ length: 34 }, (_, index) => {
  const template = exceptionTemplates[index % exceptionTemplates.length];
  const candidates = shipments.filter((shipment) => {
    if (template[0] === "POD missing") return shipment.currentStatus === "pod_pending";
    if (template[0] === "BOL missing") return shipment.currentStatus === "delivered" || shipment.currentStatus === "pod_pending";
    if (template[0] === "Pickup appointment risk") return ["en_route_pickup", "at_pickup"].includes(shipment.currentStatus);
    if (template[0] === "Delivery appointment risk") return ["in_transit", "loaded", "at_delivery"].includes(shipment.currentStatus);
    if (template[0] === "Customer update overdue") return !["delivered", "pod_pending"].includes(shipment.currentStatus);
    return !["delivered", "pod_pending"].includes(shipment.currentStatus);
  });
  const shipment = candidates[(index * 7) % candidates.length] ?? shipments[(index * 7) % shipments.length];
  return {
    id: `exception-${index + 1}`,
    shipmentId: shipment.id,
    severity: template[4],
    category: template[1],
    detectedAt: isoHoursAgo((index % 36) + 1),
    title: template[0],
    description: template[2],
    recommendedAction: template[3],
    owner: index % 3 === 0 ? "Carrier Relations" : shipment.dispatcher.name,
    dueAt: isoHoursFromNow((index % 8) - 3),
    status: index % 9 === 0 ? "in_progress" : "open",
  };
});

export const communications: CommunicationEvent[] = shipments.slice(0, 28).flatMap((shipment, index) => [
  {
    id: `communication-${index + 1}-a`,
    shipmentId: shipment.id,
    type: "status_update",
    direction: "inbound",
    party: shipment.carrier.name,
    timestamp: isoHoursAgo(index % 8),
    summary: `Driver reports ${index % 2 === 0 ? "clear roads and steady progress" : "a short delay at the previous stop"}.`,
    channel: index % 3 === 0 ? "phone" : "portal",
    automated: false,
  },
  {
    id: `communication-${index + 1}-b`,
    shipmentId: shipment.id,
    type: "customer_update",
    direction: "outbound",
    party: shipment.customer.name,
    timestamp: isoHoursAgo(index % 5),
    summary: "Checkpoint update sent with current ETA and next action.",
    channel: "email",
    automated: index % 4 === 0,
  },
]);

export const documents: Document[] = shipments.slice(0, 40).flatMap((shipment, index) => [
  {
    id: `document-${index + 1}-bol`,
    shipmentId: shipment.id,
    type: "BOL",
    status: shipment.bolStatus,
    receivedAt: shipment.bolStatus === "missing" ? undefined : isoHoursAgo(index + 2),
    verifiedAt: shipment.bolStatus === "verified" ? isoHoursAgo(index + 1) : undefined,
  },
  {
    id: `document-${index + 1}-pod`,
    shipmentId: shipment.id,
    type: "POD",
    status: shipment.podStatus,
    receivedAt: shipment.podStatus === "missing" ? undefined : isoHoursAgo(index),
    verifiedAt: shipment.podStatus === "verified" ? isoHoursAgo(index - 1) : undefined,
  },
]);

export const timelineEvents: TimelineEvent[] = shipments.slice(0, 28).flatMap((shipment, index) => [
  {
    id: `timeline-${index + 1}-status`,
    shipmentId: shipment.id,
    timestamp: isoHoursAgo(12),
    type: "status",
    title: "Shipment status updated",
    detail: `Moved to ${shipment.currentStatus.replaceAll("_", " ")}.`,
  },
  {
    id: `timeline-${index + 1}-tracking`,
    shipmentId: shipment.id,
    timestamp: shipment.lastTrackingUpdate,
    type: "tracking",
    title: "Tracking checkpoint",
    detail: `Last location reported near ${shipment.origin}.`,
  },
]);

export const openExceptions = exceptions.filter((item) => item.status !== "resolved");
