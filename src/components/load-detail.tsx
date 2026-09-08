"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  FileCheck2,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  PackageSearch,
  PanelLeftClose,
  Phone,
  Plus,
  Send,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { CommunicationEvent, Document, Exception, Shipment, TimelineEvent } from "@/lib/domain";

const navItems = [
  ["Control Tower", LayoutDashboard, "/"],
  ["My Queue", Zap, "/my-queue"],
  ["Loads", PackageSearch, "#"],
  ["Exceptions", AlertTriangle, "#"],
  ["Carriers", Truck, "#"],
  ["Documents", FileText, "/documents"],
  ["Customers", Users, "#"],
  ["Analytics", CircleDot, "#"],
  ["Settings", Settings, "#"],
] as const;

type Action = "carrier" | "eta" | "customer" | "exception" | "document" | "escalate" | "delivered";

const actionLabels: Record<Action, string> = {
  carrier: "Carrier contact logged",
  eta: "ETA update saved",
  customer: "Customer update sent",
  exception: "Exception draft created",
  document: "Document marked received",
  escalate: "Escalated to carrier relations",
  delivered: "Load marked delivered",
};

function relative(date: string) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  const amount = Math.abs(minutes);
  return minutes < 0 ? `in ${amount < 60 ? `${amount}m` : `${Math.round(amount / 60)}h`}` : `${Math.max(1, amount < 60 ? amount : Math.round(amount / 60))}${amount < 60 ? "m" : "h"} ago`;
}

function time(date: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export function LoadDetail({
  shipment,
  exceptions,
  communications,
  documents,
  timeline,
}: {
  shipment: Shipment;
  exceptions: Exception[];
  communications: CommunicationEvent[];
  documents: Document[];
  timeline: TimelineEvent[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [receivedDocuments, setReceivedDocuments] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const activeExceptions = exceptions.filter((item) => item.status !== "resolved");
  const attention = activeExceptions[0];
  const orderedTimeline = useMemo(() => {
    const generated: TimelineEvent[] = [
      { id: "booking", shipmentId: shipment.id, timestamp: new Date(new Date(shipment.pickupAppointment).getTime() - 48 * 3600000).toISOString(), type: "status", title: "Load booked in TMS", detail: `Customer tender accepted for ${shipment.customer.name}.` },
      { id: "tender", shipmentId: shipment.id, timestamp: new Date(new Date(shipment.pickupAppointment).getTime() - 42 * 3600000).toISOString(), type: "status", title: "Carrier tender accepted", detail: `${shipment.carrier.name} confirmed ${shipment.equipmentType}.` },
      { id: "dispatch", shipmentId: shipment.id, timestamp: new Date(new Date(shipment.pickupAppointment).getTime() - 18 * 3600000).toISOString(), type: "status", title: "Driver dispatched", detail: `${shipment.driverName} assigned to the load.` },
      ...timeline,
      ...communications.map((event) => ({ id: event.id, shipmentId: event.shipmentId, timestamp: event.timestamp, type: "communication" as const, title: event.type === "customer_update" ? "Customer notification" : "Carrier communication", detail: `${event.channel.toUpperCase()} · ${event.summary}` })),
      ...activeExceptions.map((item) => ({ id: item.id, shipmentId: item.shipmentId, timestamp: item.detectedAt, type: "exception" as const, title: `Exception created: ${item.title}`, detail: item.description })),
      ...documents.filter((item) => item.receivedAt).map((item) => ({ id: item.id, shipmentId: item.shipmentId, timestamp: item.receivedAt as string, type: "document" as const, title: `${item.type} received`, detail: `${item.type} attached to the shipment record.` })),
      ...(delivered ? [{ id: "delivered", shipmentId: shipment.id, timestamp: new Date().toISOString(), type: "status" as const, title: "Delivery confirmed", detail: "Operator marked the load delivered." }] : []),
    ];
    return generated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeExceptions, communications, delivered, documents, shipment, timeline]);

  const runAction = (action: Action) => {
    if (action === "delivered") setDelivered(true);
    if (action === "document") setReceivedDocuments((current) => [...current, "manual"]);
    setToast(actionLabels[action]);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#101419] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><div><div className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white"><span className="grid h-7 w-7 place-items-center rounded bg-cyan-400 text-[#071014]"><Zap size={15} fill="currentColor" /></span>FREIGHTFLOW</div><p className="mt-1 pl-9 text-[10px] uppercase tracking-[0.24em] text-slate-500">Load operations</p></div><button onClick={() => setSidebarOpen(false)} className="text-slate-500 lg:hidden" aria-label="Close navigation"><X size={18} /></button></div>
        <nav className="space-y-1 px-3 py-5">{navItems.map(([label, Icon, href]) => <Link key={label} href={href} className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm ${label === "Loads" ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span></Link>)}</nav>
        <div className="mt-auto border-t border-white/10 p-4"><div className="flex items-center gap-3 rounded bg-white/[0.03] p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-300">MC</div><div><p className="text-xs font-medium text-slate-200">Maya Chen</p><p className="text-[10px] text-slate-500">Dispatcher · East desk</p></div><PanelLeftClose size={14} className="ml-auto text-slate-600" /></div></div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8"><button onClick={() => setSidebarOpen(true)} className="text-slate-400 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><Link href="/my-queue" className="hover:text-slate-200">My Queue</Link><ChevronRight size={13} /><span className="text-slate-200">{shipment.loadNumber}</span></div><div className="ml-auto flex items-center gap-2"><div className="hidden items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-500 sm:flex"><SearchIcon /> Search loads <kbd className="ml-3 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600"><Command size={10} /></kbd></div><button className="relative rounded p-2 text-slate-400" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" /></button></div></header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link href="/my-queue" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-cyan-300"><ArrowLeft size={12} /> Back to queue</Link><span className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Live shipment record</span></div>
          <section className="rounded border border-white/10 bg-[#11161c]"><div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 p-5 lg:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight text-white">{shipment.loadNumber}</h1><span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">{delivered ? "delivered" : shipment.currentStatus.replaceAll("_", " ")}</span>{shipment.riskScore >= 65 && <span className="rounded border border-orange-400/30 bg-orange-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-300">at risk · {shipment.riskScore}</span>}</div><p className="mt-2 text-sm text-slate-400">{shipment.customer.name} · {shipment.origin} <span className="mx-1 text-slate-600">→</span> {shipment.destination}</p></div><div className="flex flex-wrap gap-2">{[["carrier", Phone, "Contact carrier"], ["eta", CalendarClock, "Update ETA"], ["customer", Send, "Customer update"], ["exception", Plus, "Add exception"], ["document", FileText, "Receive document"], ["escalate", ShieldAlert, "Escalate"], ["delivered", CheckCircle2, "Mark delivered"]].map(([action, Icon, label]) => <button key={action as string} onClick={() => runAction(action as Action)} className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.02] px-2.5 py-2 text-[10px] font-medium text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] hover:text-cyan-200"><Icon size={14} />{label as string}</button>)}</div></div><div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"><Info label="Customer / broker" value={`${shipment.customer.name} · ${shipment.broker.name}`} /><Info label="Dispatcher / owner" value={shipment.dispatcher.name} /><Info label="Carrier / driver" value={`${shipment.carrier.name} · ${shipment.driverName}`} /><Info label="Equipment" value={`${shipment.equipmentType} · ${shipment.driverPhone}`} /><Info label="Origin" value={shipment.origin} icon={<MapPin size={13} />} /><Info label="Destination" value={shipment.destination} icon={<MapPin size={13} />} /><Info label="Pickup appointment" value={time(shipment.pickupAppointment)} icon={<CalendarClock size={13} />} /><Info label="Delivery / current ETA" value={`${time(shipment.deliveryAppointment)} / ${time(shipment.eta)}`} icon={<Clock3 size={13} />} /></div></section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <section className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Shipment timeline</h2><p className="mt-1 text-xs text-slate-500">One operational story across TMS events, human work, tracking, documents, and exceptions.</p></div><div className="relative p-5"><div className="absolute bottom-6 left-[31px] top-6 w-px bg-white/10" />{orderedTimeline.map((event) => <TimelineRow key={event.id} event={event} />)}</div></section>
              <section className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Operations notes</h2><p className="mt-1 text-xs text-slate-500">Keep handoffs clear for the next broker or dispatcher.</p></div><div className="p-5"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a handoff note, customer requirement, or carrier context..." className="min-h-24 w-full resize-y rounded border border-white/10 bg-[#0d1217] p-3 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-cyan-400/40" /><div className="mt-3 flex justify-end"><button onClick={() => runAction("customer")} disabled={!note.trim()} className="rounded bg-cyan-400 px-3 py-2 text-xs font-semibold text-[#071014] disabled:cursor-not-allowed disabled:opacity-40">Save note</button></div></div></section>
            </div>
            <aside className="space-y-6">
              <section className={`rounded border p-5 ${attention ? "border-orange-400/30 bg-orange-400/[0.06]" : "border-emerald-400/20 bg-emerald-400/[0.04]"}`}><div className="flex items-start gap-3">{attention ? <AlertTriangle className="mt-0.5 shrink-0 text-orange-300" size={18} /> : <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} />}<div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Current attention</p><h2 className="mt-2 text-base font-semibold text-white">{attention ? "Why this shipment needs attention" : "No active exceptions"}</h2>{attention && <><p className="mt-2 text-xs leading-relaxed text-slate-300">{attention.description} Delivery appointment is {time(shipment.deliveryAppointment)} and current ETA is {time(shipment.eta)}. Carrier historical response time is {shipment.carrier.averageResponseTime} minutes.</p><div className="mt-4 rounded border border-cyan-400/20 bg-cyan-400/[0.05] p-3"><p className="text-[10px] uppercase tracking-wider text-cyan-300">Recommended action</p><p className="mt-1 text-xs font-medium text-slate-200">{attention.recommendedAction}</p></div><button onClick={() => runAction("carrier")} className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-orange-300 px-3 py-2.5 text-xs font-semibold text-[#17120b]"><Phone size={14} /> Call carrier dispatch</button></>}</div></div></section>
              <section className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Appointments & tracking</h2></div><div className="space-y-4 p-5"><Info label="Pickup" value={`${time(shipment.pickupAppointment)} · ${shipment.origin}`} icon={<CalendarClock size={13} />} /><Info label="Delivery" value={`${time(shipment.deliveryAppointment)} · ${shipment.destination}`} icon={<CalendarClock size={13} />} /><Info label="Current ETA" value={`${time(shipment.eta)} · ${new Date(shipment.eta) > new Date(shipment.deliveryAppointment) ? "trending late" : "within window"}`} icon={<Clock3 size={13} />} /><div className="border-t border-white/10 pt-4"><p className="text-[10px] uppercase tracking-wider text-slate-600">Tracking state</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-300"><span className={`h-2 w-2 rounded-full ${shipment.trackingState === "current" ? "bg-emerald-400" : "bg-orange-400"}`} />{shipment.trackingState} · last ping {relative(shipment.lastTrackingUpdate)}</p></div></div></section>
              <section className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Carrier & financials</h2></div><div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-1"><Info label="Carrier contact" value={`${shipment.carrier.contact} · ${shipment.carrier.averageResponseTime}m avg response`} icon={<Phone size={13} />} /><Info label="Rate / revenue" value={`$${shipment.rate.toLocaleString()} / $${shipment.revenue.toLocaleString()}`} /><Info label="Estimated margin" value={`$${shipment.estimatedMargin.toLocaleString()}`} /><Info label="Customer requirements" value={`${shipment.customer.slaHours}h update SLA · ${shipment.tags.join(", ")}`} icon={<Users size={13} />} /></div></section>
              <section className="rounded border border-white/10 bg-[#11161c]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Documents</h2><p className="mt-1 text-xs text-slate-500">Required before billing can move.</p></div><button onClick={() => runAction("document")} className="text-cyan-300 hover:text-cyan-200" aria-label="Receive document"><Plus size={16} /></button></div><div className="divide-y divide-white/[0.07] p-2">{[["Rate confirmation", "verified"], ["BOL", shipment.bolStatus], ["POD", shipment.podStatus], ["Lumper receipt", "pending"], ["Other supporting docs", receivedDocuments.length ? "received" : "pending"]].map(([label, status]) => <div key={label} className="flex items-center gap-3 px-3 py-3"><FileCheck2 size={15} className={status === "verified" || status === "received" ? "text-emerald-300" : "text-amber-200"} /><span className="flex-1 text-xs text-slate-300">{label}</span><span className={`text-[10px] capitalize ${status === "verified" || status === "received" ? "text-emerald-300" : "text-amber-200"}`}>{status === "missing" ? "required" : status}</span></div>)}</div></section>
              <section className="rounded border border-white/10 bg-[#11161c] p-5"><p className="text-[10px] uppercase tracking-wider text-slate-600">Exception history</p><div className="mt-3 space-y-3">{exceptions.map((item) => <div key={item.id} className="flex gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.status === "resolved" ? "bg-emerald-400" : "bg-orange-400"}`} /><div><p className="text-xs text-slate-300">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-600">{item.status} · {relative(item.detectedAt)}</p></div></div>)}</div></section>
            </aside>
          </section>
          {toast && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded border border-emerald-400/30 bg-[#151b22] px-4 py-3 text-xs text-emerald-300 shadow-2xl"><Check size={15} /> {toast}</div>}
        </main>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-600">{icon}{label}</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{value}</p></div>;
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const icon = event.type === "tracking" ? <MapPin size={14} /> : event.type === "communication" ? <MessageSquare size={14} /> : event.type === "document" ? <FileText size={14} /> : event.type === "exception" ? <AlertTriangle size={14} /> : <CircleDot size={14} />;
  return <div className="relative flex gap-4 pb-6 last:pb-0"><div className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded border ${event.type === "exception" ? "border-orange-400/30 bg-orange-400/10 text-orange-300" : "border-white/10 bg-[#172029] text-cyan-300"}`}>{icon}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-xs font-medium text-slate-200">{event.title}</p><span className="text-[10px] text-slate-600">{time(event.timestamp)} · {relative(event.timestamp)}</span></div><p className="mt-1 text-xs leading-relaxed text-slate-500">{event.detail}</p><p className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">{event.type === "tracking" ? "Automated tracking" : event.type === "communication" ? "Human communication" : event.type === "document" ? "Document event" : "Operational event"} · FreightFlow event layer</p></div></div>;
}

function SearchIcon() {
  return <span className="inline-flex"><Command size={14} /></span>;
}
