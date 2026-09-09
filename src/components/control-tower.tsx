"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  FileText,
  Filter,
  LayoutDashboard,
  Menu,
  PackageSearch,
  PanelLeftClose,
  Phone,
  Play,
  Search,
  Settings,
  Truck,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { CommunicationEvent, Document, Exception, Shipment } from "@/lib/domain";
import { prioritizedExceptions } from "@/lib/rules";
import { DemoControls, useDemoSimulation } from "@/components/demo-simulation";
import { SystemBoundary } from "@/components/system-boundary";

const navItems = [
  ["Control Tower", LayoutDashboard, "/"],
  ["My Queue", Zap, "/my-queue"],
  ["Loads", PackageSearch, "#"],
  ["Exceptions", AlertTriangle, "#"],
  ["Carriers", Truck, "/carriers"],
  ["Documents", FileText, "/documents"],
  ["Customer updates", Users, "/customer-updates"],
  ["Analytics", CircleDot, "#"],
  ["Settings", Settings, "#"],
] as const;

const quickFilters = [
  ["all", "All"],
  ["mine", "My loads"],
  ["critical", "Critical"],
  ["pickup", "Pickup risk"],
  ["delivery", "Delivery risk"],
  ["tracking", "Tracking"],
  ["documents", "Documents"],
  ["updates", "Customer updates"],
  ["carrier", "Carrier response"],
] as const;

type QueueFilter = (typeof quickFilters)[number][0];

function formatRelative(date: string) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  const absolute = Math.abs(minutes);
  if (minutes < 0) return `in ${absolute < 60 ? `${absolute}m` : `${Math.round(absolute / 60)}h`}`;
  return absolute < 60 ? `${Math.max(1, absolute)}m ago` : `${Math.round(absolute / 60)}h ago`;
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

function statusLabel(status: Shipment["currentStatus"]) {
  return status.replaceAll("_", " ");
}

function severityClass(severity: Exception["severity"]) {
  return {
    critical: "border-red-400/40 bg-red-400/10 text-red-300",
    high: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    medium: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    low: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  }[severity];
}

function exceptionMatches(exception: Exception, shipment: Shipment, filter: QueueFilter, currentUser: string) {
  if (filter === "all") return true;
  if (filter === "mine") return shipment.dispatcher.name === currentUser;
  if (filter === "critical") return exception.severity === "critical";
  if (filter === "pickup") return exception.category === "appointment" && exception.title.toLowerCase().includes("pickup");
  if (filter === "delivery") return exception.category === "appointment" && exception.title.toLowerCase().includes("delivery");
  if (filter === "tracking") return exception.category === "tracking";
  if (filter === "documents") return exception.category === "documentation";
  if (filter === "updates") return exception.category === "service";
  return exception.category === "carrier";
}

export function ControlTower({
  shipments,
  exceptions,
  communications,
  documents,
}: {
  shipments: Shipment[];
  exceptions: Exception[];
  communications: CommunicationEvent[];
  documents: Document[];
}) {
  const [activeNav, setActiveNav] = useState("Control Tower");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<string | null>(null);
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [dispatcherFilter, setDispatcherFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const currentUser = "Maya Chen";
  const demo = useDemoSimulation();
  const activeShipmentsData = useMemo(() => {
    if (!demo.injectedException && !demo.lastEvent) return shipments;
    const target = shipments[0];
    if (!target) return shipments;
    return shipments.map((shipment) => shipment.id === target.id ? {
      ...shipment,
      currentStatus: demo.injectedException === "late pickup" ? "en_route_pickup" : demo.injectedException === "late delivery" ? "in_transit" : shipment.currentStatus,
      trackingState: demo.injectedException === "stale tracking" || demo.injectedException === "carrier non-response" ? "stale" : shipment.trackingState,
      riskScore: demo.injectedException ? 92 : shipment.riskScore,
      riskReasons: demo.injectedException ? [`Demo: ${demo.injectedException}`, "Human action required"] : shipment.riskReasons,
    } : shipment);
  }, [demo.injectedException, demo.lastEvent, shipments]);
  const activeExceptions = useMemo(() => {
    if (!demo.injectedException || !activeShipmentsData[0]) return exceptions;
    const target = activeShipmentsData[0];
    const titles: Record<string, string> = { "stale tracking": "Stale tracking", "late pickup": "Late pickup risk", "late delivery": "Delivery appointment at risk", "carrier non-response": "Carrier non-response", "missing POD": "POD missing", "equipment breakdown": "Equipment issue" };
    return [...exceptions.filter((exception) => exception.shipmentId !== target.id), { id: "demo-injected-exception", shipmentId: target.id, severity: "critical" as const, category: demo.injectedException === "missing POD" ? "documentation" as const : "carrier" as const, detectedAt: new Date().toISOString(), title: titles[demo.injectedException], description: `Presenter injected ${demo.injectedException} to demonstrate surfaced operational work.`, recommendedAction: demo.injectedException === "carrier non-response" ? "Contact carrier dispatch and escalate after two attempts." : "Review the load and take the recommended exception action.", owner: target.dispatcher.name, dueAt: new Date().toISOString(), status: "open" as const }];
  }, [activeShipmentsData, demo.injectedException, exceptions]);
  const shipmentById = useMemo(() => new Map(activeShipmentsData.map((shipment) => [shipment.id, shipment])), [activeShipmentsData]);
  const prioritized = useMemo(() => prioritizedExceptions(activeExceptions, activeShipmentsData), [activeExceptions, activeShipmentsData]);

  const filteredQueue = useMemo(
    () =>
      prioritized.filter(({ exception, shipment }) => {
        if (!shipment || !exceptionMatches(exception, shipment, filter, currentUser)) return false;
        return (
          (brokerFilter === "all" || shipment.broker.id === brokerFilter) &&
          (dispatcherFilter === "all" || shipment.dispatcher.id === dispatcherFilter) &&
          (customerFilter === "all" || shipment.customer.id === customerFilter) &&
          (carrierFilter === "all" || shipment.carrier.id === carrierFilter)
        );
      }),
    [brokerFilter, carrierFilter, customerFilter, dispatcherFilter, filter, prioritized],
  );
  const selected = prioritized.find((item) => item.exception.id === selectedException);
  const activeShipments = activeShipmentsData.filter((shipment) => shipment.currentStatus !== "closed");
  const criticalCount = activeExceptions.filter((item) => item.severity === "critical").length;
  const healthyCount = activeShipments.filter((shipment) => shipment.riskScore < 45).length;
  const watchCount = activeShipments.filter((shipment) => shipment.riskScore >= 45 && shipment.riskScore < 65).length;
  const actionCount = activeShipments.filter((shipment) => shipment.riskScore >= 65 && shipment.riskScore < 82).length;
  const latePickups = activeShipments.filter((shipment) => new Date(shipment.pickupAppointment) < new Date() && !["loaded", "in_transit", "at_delivery", "delivered", "pod_pending"].includes(shipment.currentStatus)).length;
  const lateDeliveries = activeShipments.filter((shipment) => new Date(shipment.eta) > new Date(shipment.deliveryAppointment) && ["in_transit", "at_delivery"].includes(shipment.currentStatus)).length;
  const missingPod = activeShipmentsData.filter((shipment) => shipment.podStatus === "missing").length;
  const customerUpdatesDue = activeShipmentsData.filter((shipment) => new Date(shipment.customerUpdateDue) <= new Date()).length;
  const upcoming = [...activeShipments].sort((a, b) => new Date(a.pickupAppointment).getTime() - new Date(b.pickupAppointment).getTime()).slice(0, 5);
  const activity = [
    ...communications.map((event) => ({ id: event.id, time: event.timestamp, icon: event.type === "customer_update" ? Users : Phone, title: event.type === "customer_update" ? "Customer notification sent" : "Carrier response received", detail: `${event.party} · ${event.summary}` })),
    ...documents.filter((document) => document.status === "received" || document.status === "verified").map((document) => ({ id: document.id, time: document.receivedAt ?? new Date().toISOString(), icon: FileText, title: `${document.type} received`, detail: `${shipmentById.get(document.shipmentId)?.loadNumber} · ${document.status}` })),
    ...activeExceptions.filter((exception) => exception.status === "in_progress").map((exception) => ({ id: exception.id, time: exception.detectedAt, icon: AlertTriangle, title: "Exception escalated", detail: `${shipmentById.get(exception.shipmentId)?.loadNumber} · ${exception.title}` })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  const filterConfigs: { label: string; value: string; setter: (value: string) => void; options: { id: string; name: string }[] }[] = [
    { label: "Broker", value: brokerFilter, setter: setBrokerFilter, options: brokersFor(shipments) },
    { label: "Dispatcher", value: dispatcherFilter, setter: setDispatcherFilter, options: dispatchersFor(shipments) },
    { label: "Customer", value: customerFilter, setter: setCustomerFilter, options: customersFor(shipments) },
    { label: "Carrier", value: carrierFilter, setter: setCarrierFilter, options: carriersFor(shipments) },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#101419] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div><div className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white"><Image src="/brand/freightflow-mark.svg" alt="" width={28} height={28} />FREIGHTFLOW</div><p className="mt-1 pl-9 text-[10px] uppercase tracking-[0.24em] text-slate-500">Control tower</p></div>
          <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="px-3 py-5"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Operations</p><nav className="space-y-1">{navItems.map(([label, Icon, href]) => href === "#" ? <button key={label} onClick={() => { setActiveNav(label); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition ${activeNav === label ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{label === "Exceptions" && <span className="ml-auto rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">{exceptions.length}</span>}</button> : <Link key={label} href={href} onClick={() => { setActiveNav(label); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition ${activeNav === label ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span></Link>)}</nav></div>
        <div className="mt-auto border-t border-white/10 p-4"><div className="flex items-center gap-3 rounded bg-white/[0.03] p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-300">MC</div><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">Maya Chen</p><p className="text-[10px] text-slate-500">Dispatcher · East desk</p></div><PanelLeftClose size={14} className="ml-auto text-slate-600" /></div></div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="rounded p-2 text-slate-400 hover:bg-white/5 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><span className="text-slate-200">{activeNav}</span><ChevronRight size={13} /><span>Tuesday, Sep 8, 2026</span></div>
          <div className="ml-auto flex items-center gap-2"><button className="hidden h-9 items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-500 sm:flex"><Search size={14} /> Search loads <kbd className="ml-4 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600"><Command size={10} /></kbd><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600">K</kbd></button><button className="relative rounded p-2 text-slate-400 hover:bg-white/5" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" /></button><span className="hidden rounded border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:block">Demo mode</span></div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">
          <SystemBoundary />
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Live operations / East desk</p><h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">Good morning, Maya.</h1><p className="mt-2 text-sm text-slate-500">Here is the work that needs a human today. <span className="text-slate-300">{activeExceptions.length} active exceptions</span> across {activeShipments.length} loads.</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />{demo.paused ? "Demo paused" : "Simulated live feed"}</div></div>
          <div className="mb-5 flex max-w-3xl flex-wrap items-center gap-3"><div className="min-w-[min(100%,620px)] flex-1"><DemoControls /></div><Link href="/demo-story" className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 hover:border-cyan-400/30 hover:text-cyan-300"><Play size={12} /> Guided demo story</Link></div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
            {[
              ["Active loads", activeShipments.length, "network", "text-white"],
              ["Healthy", healthyCount, `${Math.round((healthyCount / activeShipments.length) * 100)}% on plan`, "text-emerald-300"],
              ["Attention", activeExceptions.length, `${actionCount} action required`, "text-amber-200"],
              ["Critical", criticalCount, "needs owner now", "text-red-300"],
              ["Late pickups", latePickups, "appointment risk", "text-orange-300"],
              ["Late deliveries", lateDeliveries, "ETA past appointment", "text-orange-300"],
              ["Missing POD", missingPod, "billing exposure", "text-amber-200"],
              ["Updates due", customerUpdatesDue, "customer SLA", "text-cyan-300"],
            ].map(([label, value, detail, color]) => <div key={label} className="rounded border border-white/10 bg-[#11161c] p-3.5"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p><p className={`mt-2 text-xl font-semibold tracking-tight ${color}`}>{value}</p><p className="mt-1 truncate text-[10px] text-slate-600">{detail}</p></div>)}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 rounded border border-white/10 bg-[#11161c]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Operations health</h2><p className="mt-1 text-xs text-slate-500">Risk bands turn 80 loads into a clear work plan.</p></div><span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-600"><CircleDot size={12} className="text-emerald-400" /> live risk model</span></div>
              <div className="grid gap-5 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(#34d399 0deg ${(healthyCount / activeShipments.length) * 360}deg, #fbbf24 ${(healthyCount / activeShipments.length) * 360}deg ${((healthyCount + watchCount) / activeShipments.length) * 360}deg, #fb923c ${((healthyCount + watchCount) / activeShipments.length) * 360}deg ${((healthyCount + watchCount + actionCount) / activeShipments.length) * 360}deg, #f87171 ${((healthyCount + watchCount + actionCount) / activeShipments.length) * 360}deg 360deg)` }}><div className="grid h-24 w-24 place-items-center rounded-full bg-[#11161c]"><div className="text-center"><p className="text-2xl font-semibold text-white">{activeShipments.length}</p><p className="text-[9px] uppercase tracking-wider text-slate-600">active loads</p></div></div></div>
                <div className="grid gap-3 sm:grid-cols-2">{[["Healthy", healthyCount, "No intervention", "bg-emerald-400"], ["Watch", watchCount, "Monitor next event", "bg-amber-300"], ["Action required", actionCount, "Owner needed today", "bg-orange-400"], ["Critical", criticalCount, "Intervene now", "bg-red-400"]].map(([label, count, detail, dot]) => <div key={label} className="flex items-start gap-2.5"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} /><div><p className="text-sm text-slate-200">{label} <span className="ml-1 font-mono text-slate-500">{count}</span></p><p className="mt-0.5 text-[11px] text-slate-600">{detail}</p></div></div>)}</div>
              </div>
            </div>
            <div className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">What changes the day</h2><p className="mt-1 text-xs text-slate-500">Signals worth acting on.</p></div><div className="space-y-4 p-5"><div className="flex gap-3"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-300" /><div><p className="text-xs font-medium text-slate-300">{lateDeliveries + 3} deliveries trending late</p><p className="mt-1 text-[11px] leading-relaxed text-slate-600">Review appointment risk before the next customer update window.</p></div></div><div className="flex gap-3"><FileText size={16} className="mt-0.5 shrink-0 text-amber-200" /><div><p className="text-xs font-medium text-slate-300">{missingPod} loads blocked by POD</p><p className="mt-1 text-[11px] leading-relaxed text-slate-600">Revenue stays on billing hold until documents are verified.</p></div></div><div className="flex gap-3"><ArrowDownRight size={16} className="mt-0.5 shrink-0 text-cyan-300" /><div><p className="text-xs font-medium text-slate-300">Carrier response window narrowing</p><p className="mt-1 text-[11px] leading-relaxed text-slate-600">Four open items are due inside the next two hours.</p></div></div></div></div>
          </section>

          <section className="mt-6 rounded border border-white/10 bg-[#11161c]">
            <div className="border-b border-white/10 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-white">Exception queue</h2><p className="mt-1 text-xs text-slate-500">The next action is visible before you open the load.</p></div><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600"><Filter size={13} /> {filteredQueue.length} shown</div></div>
              <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">{quickFilters.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded border px-2.5 py-1.5 text-[10px] font-medium transition ${filter === value ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"}`}>{label}</button>)}</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{filterConfigs.map(({ label, value, setter, options }) => <label key={label} className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600"><UserRound size={12} /><span className="sr-only">{label}</span><select value={value} onChange={(event) => setter(event.target.value)} className="min-w-0 flex-1 rounded border border-white/10 bg-[#0d1217] px-2 py-2 text-xs normal-case tracking-normal text-slate-400 outline-none focus:border-cyan-400/40"><option value="all">All {label}s</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>)}</div>
            </div>
            <div className="divide-y divide-white/[0.07]">{filteredQueue.slice(0, 10).map(({ exception, shipment, score }, index) => <button key={exception.id} onClick={() => setSelectedException(exception.id)} className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03] lg:grid-cols-[28px_minmax(250px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]"><span className="pt-1 text-xs font-mono text-slate-600">0{index + 1}</span><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(exception.severity)}`}>{exception.severity}</span><span className="text-xs font-semibold text-white">{shipment?.loadNumber}</span></span><span className="mt-2 block truncate text-xs font-medium text-slate-300">{exception.title}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{shipment?.customer.name}</span></span><span className="min-w-0"><span className="block truncate text-xs text-slate-300">{shipment?.origin} → {shipment?.destination}</span><span className="mt-1 block text-[11px] capitalize text-slate-600">{statusLabel(shipment?.currentStatus ?? "in_transit")} · {shipment?.equipmentType}</span><span className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500"><span>Appt {formatTime(shipment?.pickupAppointment ?? new Date().toISOString())}</span><span>ETA {formatTime(shipment?.eta ?? new Date().toISOString())}</span></span></span><span className="min-w-0"><span className="block text-[10px] uppercase tracking-wider text-slate-600">Why now</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{exception.description}</span><span className="mt-2 block text-[11px] text-cyan-300">{exception.recommendedAction}</span></span><span className="flex items-start justify-between gap-3 lg:block lg:text-right"><span className="flex items-center gap-1 text-[10px] text-slate-600 lg:justify-end"><Clock3 size={12} /> {formatRelative(exception.detectedAt)}</span><span className="mt-2 block text-[10px] text-slate-500 lg:text-right">Owner <span className="text-slate-300">{exception.owner}</span></span><span className="mt-2 flex items-center justify-end gap-1 font-mono text-xs text-slate-500">{score}<ChevronRight size={14} /></span></span></button>)}</div>
            {filteredQueue.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No exceptions match these filters.</div>}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded border border-white/10 bg-[#11161c]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Load activity</h2><p className="mt-1 text-xs text-slate-500">The latest events across your operating network.</p></div><ArrowUpRight size={15} className="text-slate-600" /></div><div className="divide-y divide-white/[0.07]">{activity.map((item) => { const Icon = item.icon; return <div key={item.id} className="flex gap-3 px-5 py-3.5"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded bg-white/[0.04] text-cyan-300"><Icon size={14} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-300">{item.title}</p><p className="mt-1 truncate text-[11px] text-slate-600">{item.detail}</p></div><span className="ml-auto shrink-0 text-[10px] text-slate-600">{formatRelative(item.time)}</span></div>; })}</div></div>
            <div className="rounded border border-white/10 bg-[#11161c]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Today&apos;s timeline</h2><p className="mt-1 text-xs text-slate-500">Upcoming appointments that need a plan.</p></div><span className="text-[10px] uppercase tracking-wider text-slate-600">{upcoming.length} next</span></div><div className="divide-y divide-white/[0.07]">{upcoming.map((shipment) => { const isLate = new Date(shipment.pickupAppointment) < new Date() && !["loaded", "in_transit", "at_delivery", "delivered", "pod_pending"].includes(shipment.currentStatus); const endangered = shipment.riskScore >= 65 || new Date(shipment.eta) > new Date(shipment.deliveryAppointment); return <div key={shipment.id} className="flex gap-3 px-5 py-3.5"><div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isLate || endangered ? "bg-orange-400" : "bg-emerald-400"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-200">{formatTime(shipment.pickupAppointment)}</span><span className="text-xs text-slate-500">{shipment.loadNumber}</span>{(isLate || endangered) && <span className="rounded border border-orange-400/30 bg-orange-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-orange-300">{isLate ? "late" : "at risk"}</span>}</div><p className="mt-1 truncate text-[11px] text-slate-400">{shipment.origin} → {shipment.destination}</p><p className="mt-1 truncate text-[10px] text-slate-600">{shipment.customer.name} · {statusLabel(shipment.currentStatus)}</p></div><span className="text-[10px] text-slate-600">{shipment.dispatcher.name.split(" ")[0]}</span></div>; })}</div></div>
          </section>

          {selected && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setSelectedException(null)}><div className="w-full max-w-lg rounded border border-white/15 bg-[#151b22] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between border-b border-white/10 p-5"><div><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(selected.exception.severity)}`}>{selected.exception.severity} priority</span><h2 className="mt-3 text-lg font-semibold text-white">{selected.exception.title}</h2><p className="mt-1 text-xs text-slate-500">{selected.shipment?.loadNumber} · {selected.shipment?.customer.name}</p></div><button onClick={() => setSelectedException(null)} className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Close exception details"><X size={18} /></button></div><div className="space-y-5 p-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Why it needs attention</p><p className="mt-2 text-sm leading-relaxed text-slate-300">{selected.exception.description}</p></div><div className="rounded border border-cyan-400/20 bg-cyan-400/[0.05] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Recommended next action</p><p className="mt-2 text-sm text-slate-200">{selected.exception.recommendedAction}</p></div><div className="flex items-center justify-between text-xs text-slate-500"><span>Owner: <span className="text-slate-300">{selected.exception.owner}</span></span><span className="flex items-center gap-1"><Clock3 size={13} /> Detected {formatRelative(selected.exception.detectedAt)}</span></div><button className="flex w-full items-center justify-center gap-2 rounded bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#071014] hover:bg-cyan-300"><CheckCircle2 size={16} /> Mark in progress</button></div></div></div>}
        </main>
      </div>
    </div>
  );
}

function brokersFor(shipments: Shipment[]) { return uniquePeople(shipments.map((shipment) => shipment.broker)); }
function dispatchersFor(shipments: Shipment[]) { return uniquePeople(shipments.map((shipment) => shipment.dispatcher)); }
function customersFor(shipments: Shipment[]) { return uniquePeople(shipments.map((shipment) => shipment.customer)); }
function carriersFor(shipments: Shipment[]) { return uniquePeople(shipments.map((shipment) => shipment.carrier)); }
function uniquePeople<T extends { id: string }>(people: T[]) { return Array.from(new Map(people.map((person) => [person.id, person])).values()); }
