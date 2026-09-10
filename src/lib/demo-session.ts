import { z } from "zod";
import * as seed from "./demo-data";
import { DEMO_NOW } from "./demo-clock";
import type { CommunicationEvent, Exception } from "./domain";

const schema = z.object({
  version: z.literal(1),
  statuses: z.record(z.enum(["open", "in_progress", "snoozed", "resolved"])),
  owners: z.record(z.string()),
  actions: z.record(z.string()),
  received: z.array(z.string().refine(id => seed.shipments.some(s => s.id === id))),
  updates: z.array(z.object({ shipmentId: z.string().refine(id => seed.shipments.some(s => s.id === id)), text: z.string() })),
  injected: z.string().nullable(),
});
export type DemoSession = z.infer<typeof schema>;
export const emptySession: DemoSession = { version: 1, statuses: {}, owners: {}, actions: {}, received: [], updates: [], injected: null };
export function readSession(raw: string | null): DemoSession {
  try { return schema.parse(JSON.parse(raw ?? "null")); } catch { return emptySession; }
}
export type DemoAction =
  | { type: "exception"; id: string; status?: Exception["status"]; owner?: string; label: string }
  | { type: "document"; shipmentId: string }
  | { type: "communication"; shipmentId: string; text: string }
  | { type: "inject"; title: string }
  | { type: "reset" };

export function reduceSession(state: DemoSession, action: DemoAction): DemoSession {
  if (action.type === "reset") return emptySession;
  if (action.type === "inject") return { ...state, injected: action.title, statuses: { ...state.statuses, "demo-injected-exception": "open" } };
  if (action.type === "exception") {
    if (!seed.exceptions.some(e => e.id === action.id) && action.id !== "demo-injected-exception") return state;
    return { ...state, statuses: action.status ? { ...state.statuses, [action.id]: action.status } : state.statuses, owners: action.owner ? { ...state.owners, [action.id]: action.owner } : state.owners, actions: { ...state.actions, [action.id]: action.label } };
  }
  if (!seed.shipments.some(s => s.id === action.shipmentId)) return state;
  if (action.type === "document") return { ...state, received: [...new Set([...state.received, action.shipmentId])] };
  return { ...state, updates: [...state.updates, { shipmentId: action.shipmentId, text: action.text }].slice(-100) };
}

export function sessionData(state: DemoSession) {
  const injected: Exception[] = state.injected ? [{ id: "demo-injected-exception", shipmentId: seed.shipments[0].id, severity: "critical", category: state.injected === "missing POD" ? "documentation" : "carrier", detectedAt: new Date(DEMO_NOW).toISOString(), dueAt: new Date(DEMO_NOW).toISOString(), title: `Demo: ${state.injected}`, description: "Presenter-injected fictional exception.", recommendedAction: "Review the load and simulate the next action.", owner: seed.shipments[0].dispatcher.name, status: "open" }] : [];
  const exceptions = [...seed.exceptions, ...injected].map(e => ({ ...e, status: state.statuses[e.id] ?? e.status, owner: state.owners[e.id] ?? e.owner }));
  const shipments = seed.shipments.map(s => state.received.includes(s.id) ? { ...s, podStatus: "received" as const } : s);
  const documents = seed.documents.map(d => d.type === "POD" && state.received.includes(d.shipmentId) ? { ...d, status: "received" as const, receivedAt: new Date(DEMO_NOW).toISOString() } : d);
  for (const id of state.received) if (!documents.some(d => d.shipmentId === id && d.type === "POD")) documents.push({ id: `demo-pod-${id}`, shipmentId: id, type: "POD", status: "received", receivedAt: new Date(DEMO_NOW).toISOString() });
  const updates: CommunicationEvent[] = state.updates.map((u, i) => ({ id: `demo-update-${i}`, shipmentId: u.shipmentId, type: "customer_update", direction: "outbound", party: seed.shipments.find(s => s.id === u.shipmentId)!.customer.name, timestamp: new Date(DEMO_NOW + i * 1000).toISOString(), summary: `SIMULATION — not sent: ${u.text}`, channel: "email", automated: false }));
  return { shipments, exceptions, documents, communications: [...updates.reverse(), ...seed.communications], carriers: seed.carriers, customers: seed.customers, timeline: seed.timelineEvents };
}
