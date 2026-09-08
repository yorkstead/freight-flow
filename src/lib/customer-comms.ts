import type { Customer, Exception, Shipment } from "@/lib/domain";

export type NotificationChannel = "email" | "SMS" | "portal";
export type CustomerPreference = "hourly" | "milestone" | "exceptions" | "pickup_delivery_eta";
export type CommunicationMode = "automatic" | "human-approved" | "manually written";

export interface CustomerNotificationProfile {
  customer: Customer;
  preference: CustomerPreference;
  channels: NotificationChannel[];
  description: string;
}

export interface CustomerUpdateDue {
  shipment: Shipment;
  reason: string;
  urgency: "routine" | "approval required" | "critical escalation";
  mode: CommunicationMode;
  owner: string;
  suggestedEvent: string;
  dueAt: string;
}

const profiles: Array<{ preference: CustomerPreference; channels: NotificationChannel[]; description: string }> = [
  { preference: "hourly", channels: ["email", "portal"], description: "Hourly checkpoints while the load is active." },
  { preference: "milestone", channels: ["email"], description: "Milestones only: pickup, loaded, ETA update, delivery, POD." },
  { preference: "exceptions", channels: ["SMS", "email"], description: "Only service exceptions and recovery updates." },
  { preference: "pickup_delivery_eta", channels: ["portal", "SMS"], description: "Pickup, delivery, and ETA changes over 30 minutes." },
];

export const notificationEvents = [
  "Carrier assigned",
  "Driver dispatched",
  "Pickup confirmed",
  "Loaded",
  "In transit",
  "ETA updated",
  "Delivery risk detected",
  "Delivery confirmed",
  "POD available",
] as const;

export function customerProfiles(customers: Customer[]): CustomerNotificationProfile[] {
  return customers.map((customer, index) => ({ customer, ...profiles[index % profiles.length] }));
}

export function updatesDue(shipments: Shipment[], exceptions: Exception[]): CustomerUpdateDue[] {
  return shipments
    .filter((shipment) => new Date(shipment.customerUpdateDue).getTime() <= Date.now())
    .map((shipment) => {
      const critical = exceptions.some((exception) => exception.shipmentId === shipment.id && exception.severity === "critical" && exception.status !== "resolved");
      const exception = exceptions.find((item) => item.shipmentId === shipment.id && item.status !== "resolved");
      const urgency: CustomerUpdateDue["urgency"] = critical ? "critical escalation" : exception ? "approval required" : "routine";
      const mode: CommunicationMode = critical || exception ? "human-approved" : "automatic";
      return {
        shipment,
        reason: exception?.title ?? "Customer checkpoint is due",
        urgency,
        mode,
        owner: critical ? "Operations Manager + Broker" : shipment.dispatcher.name,
        suggestedEvent: exception ? "Delivery risk detected" : "ETA updated",
        dueAt: shipment.customerUpdateDue,
      };
    })
    .sort((a, b) => {
      const rank: Record<CustomerUpdateDue["urgency"], number> = { "critical escalation": 0, "approval required": 1, routine: 2 };
      return rank[a.urgency] - rank[b.urgency] || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
}

export function previewMessage(update: CustomerUpdateDue, channel: NotificationChannel, customMessage?: string) {
  if (customMessage?.trim()) return customMessage.trim();
  const { shipment } = update;
  const prefix = channel === "SMS" ? "FreightFlow update:" : `Hello ${shipment.customer.name},`;
  return `${prefix} ${shipment.loadNumber} is currently ${shipment.currentStatus.replaceAll("_", " ")} from ${shipment.origin} to ${shipment.destination}. ${update.reason}. Current ETA is ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(shipment.eta))}. We will send the next update when the status changes.`;
}
