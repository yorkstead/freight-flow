export const shipmentStatuses = [
  "dispatched",
  "en_route_pickup",
  "at_pickup",
  "loaded",
  "in_transit",
  "at_delivery",
  "delivered",
  "pod_pending",
  "billing_ready",
  "closed",
] as const;

export type ShipmentStatus = (typeof shipmentStatuses)[number];
export type Severity = "critical" | "high" | "medium" | "low";
export type ExceptionStatus = "open" | "in_progress" | "snoozed" | "resolved";
export type TrackingState = "current" | "stale" | "offline";
export type DocumentStatus = "missing" | "received" | "verified" | "rejected";

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  accountCode: string;
  slaHours: number;
  activeLoads: number;
}

export interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  dotNumber: string;
  contact: string;
  activeLoads: number;
  onTimePickupRate: number;
  onTimeDeliveryRate: number;
  averageResponseTime: number;
  trackingCompliance: number;
  exceptionRate: number;
  podTurnaround: number;
  score: number;
}

export interface Shipment {
  id: string;
  loadNumber: string;
  sourceSystem: "TMS";
  sourceRecordId: string;
  customer: Customer;
  broker: Person;
  dispatcher: Person;
  origin: string;
  destination: string;
  pickupAppointment: string;
  deliveryAppointment: string;
  currentStatus: ShipmentStatus;
  carrier: Carrier;
  driverName: string;
  driverPhone: string;
  equipmentType: string;
  rate: number;
  revenue: number;
  estimatedMargin: number;
  lastCarrierContact: string;
  lastTrackingUpdate: string;
  eta: string;
  trackingState: TrackingState;
  customerUpdateDue: string;
  podStatus: DocumentStatus;
  bolStatus: DocumentStatus;
  billingStatus: "not_ready" | "ready" | "held";
  riskScore: number;
  riskReasons: string[];
  tags: string[];
}

export type ExceptionCategory =
  | "tracking"
  | "appointment"
  | "carrier"
  | "documentation"
  | "service"
  | "financial"
  | "disruption";

export interface Exception {
  id: string;
  shipmentId: string;
  severity: Severity;
  category: ExceptionCategory;
  detectedAt: string;
  title: string;
  description: string;
  recommendedAction: string;
  owner: string;
  dueAt: string;
  status: ExceptionStatus;
  resolvedAt?: string;
}

export interface CommunicationEvent {
  id: string;
  shipmentId: string;
  type: "check_in" | "status_update" | "escalation" | "customer_update";
  direction: "inbound" | "outbound";
  party: string;
  timestamp: string;
  summary: string;
  channel: "phone" | "sms" | "email" | "portal";
  automated: boolean;
}

export interface Document {
  id: string;
  shipmentId: string;
  type: "BOL" | "POD" | "lumper_receipt" | "detention";
  status: DocumentStatus;
  receivedAt?: string;
  verifiedAt?: string;
}

export interface TimelineEvent {
  id: string;
  shipmentId: string;
  timestamp: string;
  type: "status" | "tracking" | "communication" | "document" | "exception";
  title: string;
  detail: string;
}
