import type { Document, Shipment } from "@/lib/domain";

export type DocumentNeed =
  | "POD"
  | "Signed BOL"
  | "Lumper receipt"
  | "Accessorial documentation"
  | "Detention documentation"
  | "Rate confirmation"
  | "Customer-specific paperwork";

export type DocumentQueueStage =
  | "POD pending"
  | "Documents received"
  | "Verification required";

export interface DocumentQueueItem {
  id: string;
  shipment: Shipment;
  carrier: string;
  deliveredAt: string;
  needed: DocumentNeed;
  stage: DocumentQueueStage;
  ageHours: number;
  owner: string;
  lastContact: string;
  amount: number;
  recommendedAction: string;
  followUp: "Reminder due" | "Escalate now" | "Carrier relations queue" | "Verify documents";
  bucket: "POD missing" | "Accessorial approval" | "Verification" | "Customer requirement";
}

const hoursSince = (timestamp: string) =>
  Math.max(1, Math.round((Date.now() - new Date(timestamp).getTime()) / 3_600_000));

const missingDocument = (documents: Document[], shipmentId: string, type: Document["type"]) =>
  documents.find((document) => document.shipmentId === shipmentId && document.type === type);

export function buildDocumentQueue(shipments: Shipment[], documents: Document[]): DocumentQueueItem[] {
  const queueItems: DocumentQueueItem[] = shipments
    .filter((shipment) => ["delivered", "pod_pending", "billing_ready"].includes(shipment.currentStatus))
    .flatMap((shipment, index): DocumentQueueItem[] => {
      const pod = missingDocument(documents, shipment.id, "POD");
      const bol = missingDocument(documents, shipment.id, "BOL");
      const ageHours = hoursSince(shipment.deliveryAppointment);
      const owner = index % 3 === 0 ? "Billing Ops" : shipment.dispatcher.name;
      const amount = shipment.revenue;

      if (!pod || pod.status === "missing") {
        return [{
          id: `${shipment.id}-pod`,
          shipment,
          carrier: shipment.carrier.name,
          deliveredAt: shipment.deliveryAppointment,
          needed: "POD" as const,
          stage: "POD pending" as const,
          ageHours,
          owner,
          lastContact: shipment.lastCarrierContact,
          amount,
          recommendedAction: ageHours >= 48 ? "Move to carrier relations and request signed POD." : "Send carrier a POD reminder with the billing cutoff.",
          followUp: ageHours >= 48 ? "Carrier relations queue" as const : ageHours >= 24 ? "Escalate now" as const : "Reminder due" as const,
          bucket: "POD missing" as const,
        }];
      }

      if (!bol || bol.status === "missing") {
        return [{
          id: `${shipment.id}-bol`,
          shipment,
          carrier: shipment.carrier.name,
          deliveredAt: shipment.deliveryAppointment,
          needed: "Signed BOL" as const,
          stage: "Documents received" as const,
          ageHours,
          owner,
          lastContact: shipment.lastCarrierContact,
          amount,
          recommendedAction: "Request the signed BOL before verification can complete.",
          followUp: "Reminder due" as const,
          bucket: "Verification" as const,
        }];
      }

      const specialNeed: DocumentNeed | null =
        index % 5 === 0 ? "Detention documentation" :
        index % 4 === 0 ? "Lumper receipt" :
        index % 3 === 0 ? "Customer-specific paperwork" : null;

      if (specialNeed) {
        const isCustomerRequirement = specialNeed === "Customer-specific paperwork";
        return [{
          id: `${shipment.id}-supporting`,
          shipment,
          carrier: shipment.carrier.name,
          deliveredAt: shipment.deliveryAppointment,
          needed: specialNeed,
          stage: "Verification required" as const,
          ageHours,
          owner,
          lastContact: shipment.lastCarrierContact,
          amount,
          recommendedAction: isCustomerRequirement ? "Confirm consignee paperwork against the customer checklist." : "Verify supporting charges and attach approval to the load.",
          followUp: "Verify documents" as const,
          bucket: isCustomerRequirement ? "Customer requirement" as const : "Accessorial approval" as const,
        }];
      }

      return [];
    })
  return queueItems.sort((a, b) => b.amount - a.amount || b.ageHours - a.ageHours);
}

export const documentAutomationRules = [
  { threshold: "12 hours", action: "Reminder", detail: "Send an automated POD reminder to the carrier contact." },
  { threshold: "24 hours", action: "Carrier escalation", detail: "Create a carrier escalation and assign it to the dispatcher." },
  { threshold: "48 hours", action: "Carrier relations queue", detail: "Route the blocked invoice to Carrier Relations for live follow-up." },
] as const;
