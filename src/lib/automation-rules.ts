import type { Exception, Shipment } from "@/lib/domain";

export type AutomationRuleSeverity = "info" | "warning" | "critical";
export type AutomationRuleId =
  | "STALE_TRACKING_WARNING"
  | "STALE_TRACKING_CRITICAL"
  | "DELIVERY_RISK_LATE"
  | "DELIVERY_RISK_LOW_CONFIDENCE"
  | "CUSTOMER_UPDATE_OVERDUE"
  | "CUSTOMER_UPDATE_DUE_SOON"
  | "POD_FOLLOW_UP"
  | "POD_ESCALATION"
  | "BOL_MISSING"
  | "CARRIER_NON_RESPONSE"
  | "PICKUP_APPOINTMENT_RISK"
  | "BILLING_DOCUMENT_HOLD";

export interface AutomationRule {
  id: AutomationRuleId;
  name: string;
  trigger: string;
  severity: AutomationRuleSeverity;
  action: string;
  escalation: string;
  category: "tracking" | "appointments" | "customer" | "documents" | "carrier";
  enabled: boolean;
}

export interface RuleMatch {
  rule: AutomationRule;
  shipment: Shipment;
  exception?: Exception;
}

export const automationRules: AutomationRule[] = [
  { id: "STALE_TRACKING_WARNING", name: "Stale tracking warning", trigger: "Status is in_transit AND last tracking update is over 60 minutes old", severity: "warning", action: "Verify driver location", escalation: "Escalate at 120 minutes", category: "tracking", enabled: true },
  { id: "STALE_TRACKING_CRITICAL", name: "Stale tracking critical", trigger: "Status is in_transit AND last tracking update is over 120 minutes old", severity: "critical", action: "Contact carrier immediately", escalation: "Assign to carrier relations if no response", category: "tracking", enabled: true },
  { id: "DELIVERY_RISK_LATE", name: "Delivery appointment at risk", trigger: "ETA is later than delivery appointment", severity: "critical", action: "Request revised ETA and notify customer", escalation: "Broker and operations manager review", category: "appointments", enabled: true },
  { id: "DELIVERY_RISK_LOW_CONFIDENCE", name: "Low ETA buffer", trigger: "ETA is within 30 minutes of appointment AND tracking is stale", severity: "warning", action: "Confirm location before the next customer update", escalation: "Escalate if carrier does not respond", category: "appointments", enabled: true },
  { id: "CUSTOMER_UPDATE_OVERDUE", name: "Customer update overdue", trigger: "Current time is past customer notification due time", severity: "warning", action: "Create customer-update exception", escalation: "Broker approval required for service-risk drafts", category: "customer", enabled: true },
  { id: "CUSTOMER_UPDATE_DUE_SOON", name: "Customer update window", trigger: "Customer notification is due within 30 minutes", severity: "info", action: "Prepare routine update preview", escalation: "No escalation unless shipment is at risk", category: "customer", enabled: true },
  { id: "POD_FOLLOW_UP", name: "POD follow-up", trigger: "Shipment is delivered AND POD is missing for over 12 hours", severity: "warning", action: "Send POD reminder to carrier", escalation: "Escalate at 24 hours", category: "documents", enabled: true },
  { id: "POD_ESCALATION", name: "POD escalation", trigger: "Shipment is delivered AND POD is missing for over 24 hours", severity: "critical", action: "Escalate missing POD", escalation: "Route to carrier relations queue", category: "documents", enabled: true },
  { id: "BOL_MISSING", name: "Signed BOL missing", trigger: "Shipment is delivered AND signed BOL is missing", severity: "warning", action: "Request signed BOL from origin or carrier", escalation: "Place billing hold until received", category: "documents", enabled: true },
  { id: "CARRIER_NON_RESPONSE", name: "Carrier non-response", trigger: "Carrier has not responded after 2 contact attempts", severity: "critical", action: "Escalate to carrier relations", escalation: "Notify dispatcher and operations manager", category: "carrier", enabled: true },
  { id: "PICKUP_APPOINTMENT_RISK", name: "Pickup appointment risk", trigger: "Pickup appointment is within 2 hours and ETA has no operating buffer", severity: "warning", action: "Confirm appointment and carrier ETA", escalation: "Notify customer if projected late", category: "appointments", enabled: true },
  { id: "BILLING_DOCUMENT_HOLD", name: "Billing document hold", trigger: "Delivered shipment has missing POD or BOL", severity: "warning", action: "Keep invoice in document readiness queue", escalation: "Billing ops follow-up after 48 hours", category: "documents", enabled: true },
];

const hoursSince = (value: string, now = Date.now()) => (now - new Date(value).getTime()) / 3_600_000;
const hoursUntil = (value: string, now = Date.now()) => (new Date(value).getTime() - now) / 3_600_000;

export function evaluateAutomationRules(shipment: Shipment, exceptions: Exception[] = [], now = Date.now()): RuleMatch[] {
  const trackingAge = hoursSince(shipment.lastTrackingUpdate, now);
  const customerWindow = hoursUntil(shipment.customerUpdateDue, now);
  const deliveryBuffer = hoursUntil(shipment.deliveryAppointment, now);
  const pickupBuffer = hoursUntil(shipment.pickupAppointment, now);
  const carrierAttempts = exceptions.filter((exception) => exception.shipmentId === shipment.id && exception.category === "carrier").length;
  const matches: AutomationRuleId[] = [];
  if (shipment.currentStatus === "in_transit" && trackingAge > 60 / 60) matches.push("STALE_TRACKING_WARNING");
  if (shipment.currentStatus === "in_transit" && trackingAge > 120 / 60) matches.push("STALE_TRACKING_CRITICAL");
  if (new Date(shipment.eta).getTime() > new Date(shipment.deliveryAppointment).getTime()) matches.push("DELIVERY_RISK_LATE");
  if (deliveryBuffer <= 0.5 && trackingAge > 1) matches.push("DELIVERY_RISK_LOW_CONFIDENCE");
  if (customerWindow < 0) matches.push("CUSTOMER_UPDATE_OVERDUE");
  else if (customerWindow <= 0.5) matches.push("CUSTOMER_UPDATE_DUE_SOON");
  if (shipment.currentStatus === "delivered" && shipment.podStatus === "missing" && hoursSince(shipment.deliveryAppointment, now) > 12) matches.push("POD_FOLLOW_UP");
  if (shipment.currentStatus === "delivered" && shipment.podStatus === "missing" && hoursSince(shipment.deliveryAppointment, now) > 24) matches.push("POD_ESCALATION");
  if (shipment.currentStatus === "delivered" && shipment.bolStatus === "missing") matches.push("BOL_MISSING");
  if (carrierAttempts >= 2) matches.push("CARRIER_NON_RESPONSE");
  if (pickupBuffer >= 0 && pickupBuffer <= 2 && hoursUntil(shipment.eta, now) > pickupBuffer) matches.push("PICKUP_APPOINTMENT_RISK");
  if (shipment.currentStatus === "delivered" && (shipment.podStatus === "missing" || shipment.bolStatus === "missing")) matches.push("BILLING_DOCUMENT_HOLD");
  return matches.map((id) => ({ rule: automationRules.find((rule) => rule.id === id)!, shipment, exception: exceptions.find((exception) => exception.shipmentId === shipment.id) }));
}
