"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PackageSearch,
  Phone,
  RotateCcw,
  Search,
  Send,
  Timer,
  Settings,
  ShieldAlert,
  Truck,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { Exception, ExceptionStatus, Shipment } from "@/lib/domain";
import { priorityBreakdown, prioritizedExceptions } from "@/lib/rules";

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

type QueueAction = "contacted" | "response" | "eta" | "customer" | "snooze" | "escalate" | "reassign" | "resolved";

const relative = (date: string) => {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  const absolute = Math.abs(minutes);
  return minutes < 0 ? `due in ${absolute < 60 ? `${absolute}m` : `${Math.round(absolute / 60)}h`}` : `${Math.max(1, absolute < 60 ? absolute : Math.round(absolute / 60))}${absolute < 60 ? "m" : "h"} ago`;
};

const statusLabel = (status: Shipment["currentStatus"]) => status.replaceAll("_", " ");

function severityClass(severity: Exception["severity"]) {
  return {
    critical: "border-red-400/40 bg-red-400/10 text-red-300",
    high: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    medium: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    low: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  }[severity];
}

function actionLabel(action: QueueAction) {
  return { contacted: "Carrier contacted", response: "Carrier response logged", eta: "ETA update saved", customer: "Customer update sent", snooze: "Snoozed for 30 minutes", escalate: "Escalated to carrier relations", reassign: "Reassigned to Jordan Brooks", resolved: "Marked resolved" }[action];
}

export function MyQueue({ exceptions, shipments }: { exceptions: Exception[]; shipments: Shipment[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, ExceptionStatus>>({});
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [lastActions, setLastActions] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [now] = useState(() => Date.now());
  const ranked = useMemo(() => prioritizedExceptions(exceptions, shipments).filter(({ exception, shipment }) => {
    if (!shipment || statuses[exception.id] === "resolved" || statuses[exception.id] === "snoozed") return false;
    const query = search.toLowerCase();
    return !query || [shipment.loadNumber, shipment.customer.name, shipment.carrier.name, exception.title].some((value) => value.toLowerCase().includes(query));
  }), [exceptions, search, shipments, statuses]);
  const selected = ranked.find((item) => item.exception.id === selectedId) ?? prioritizedExceptions(exceptions, shipments).find((item) => item.exception.id === selectedId);
  const top = ranked[0];
  const update = (action: QueueAction) => {
    if (!selected) return;
    const id = selected.exception.id;
    if (action === "resolved") setStatuses((current) => ({ ...current, [id]: "resolved" }));
    if (action === "snooze") setStatuses((current) => ({ ...current, [id]: "snoozed" }));
    if (action === "escalate") setOwners((current) => ({ ...current, [id]: "Carrier Relations" }));
    if (action === "reassign") setOwners((current) => ({ ...current, [id]: "Jordan Brooks" }));
    setLastActions((current) => ({ ...current, [id]: actionLabel(action) }));
    setToast(actionLabel(action));
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#101419] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><div><div className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white"><span className="grid h-7 w-7 place-items-center rounded bg-cyan-400 text-[#071014]"><Zap size={15} fill="currentColor" /></span>FREIGHTFLOW</div><p className="mt-1 pl-9 text-[10px] uppercase tracking-[0.24em] text-slate-500">Operator workspace</p></div><button onClick={() => setSidebarOpen(false)} className="text-slate-500 lg:hidden" aria-label="Close navigation"><X size={18} /></button></div>
        <nav className="space-y-1 px-3 py-5">{navItems.map(([label, Icon, href]) => <a key={label} href={href} className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm ${label === "My Queue" ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{label === "My Queue" && <span className="ml-auto rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-300">{ranked.length}</span>}</a>)}</nav>
        <div className="mt-auto border-t border-white/10 p-4"><div className="flex items-center gap-3 rounded bg-white/[0.03] p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-300">MC</div><div><p className="text-xs font-medium text-slate-200">Maya Chen</p><p className="text-[10px] text-slate-500">Dispatcher · East desk</p></div></div></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8"><button onClick={() => setSidebarOpen(true)} className="text-slate-400 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><Link href="/" className="hover:text-slate-200">Control Tower</Link><ChevronRight size={13} /><span className="text-slate-200">My Queue</span></div><div className="ml-auto flex items-center gap-2"><label className="hidden h-9 items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-500 sm:flex"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search my queue" className="w-32 bg-transparent outline-none placeholder:text-slate-600" /><kbd className="ml-3 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600"><Command size={10} /></kbd></label><button className="relative rounded p-2 text-slate-400" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" /></button></div></header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><Link href="/" className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-cyan-300"><ArrowLeft size={12} /> Back to control tower</Link><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Personal operating queue</p><h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">My Queue</h1><p className="mt-2 text-sm text-slate-500">A prioritized workload, not a task list. Work from the top and clear the risk.</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />{ranked.length} items need an action</div></div>
          <section className="grid gap-3 sm:grid-cols-3"><div className="rounded border border-red-400/20 bg-red-400/[0.06] p-4"><p className="text-[10px] uppercase tracking-wider text-red-300">Immediate</p><p className="mt-2 text-2xl font-semibold text-white">{ranked.filter((item) => item.exception.severity === "critical").length}</p><p className="mt-1 text-xs text-slate-500">intervene before the next checkpoint</p></div><div className="rounded border border-orange-400/20 bg-orange-400/[0.06] p-4"><p className="text-[10px] uppercase tracking-wider text-orange-300">Due next 2 hours</p><p className="mt-2 text-2xl font-semibold text-white">{ranked.filter((item) => new Date(item.exception.dueAt).getTime() < now + 7_200_000).length}</p><p className="mt-1 text-xs text-slate-500">appointment or customer SLA exposure</p></div><div className="rounded border border-cyan-400/20 bg-cyan-400/[0.06] p-4"><p className="text-[10px] uppercase tracking-wider text-cyan-300">Queue health</p><p className="mt-2 text-2xl font-semibold text-white">{ranked.length ? Math.round((ranked.filter((item) => item.exception.severity !== "critical").length / ranked.length) * 100) : 100}%</p><p className="mt-1 text-xs text-slate-500">workable without escalation</p></div></section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Prioritized workload</h2><p className="mt-1 text-xs text-slate-500">Scored with explicit operating rules. Higher score means less time before impact.</p></div><span className="font-mono text-xs text-slate-600">{ranked.length} open</span></div></div><div className="divide-y divide-white/[0.07]">{ranked.map(({ exception, shipment, score }, index) => { if (!shipment) return null; const owner = owners[exception.id] ?? exception.owner; const action = lastActions[exception.id]; return <button key={exception.id} onClick={() => setSelectedId(exception.id)} className={`grid w-full gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03] ${selectedId === exception.id ? "bg-cyan-400/[0.05]" : ""} lg:grid-cols-[52px_minmax(200px,1.2fr)_minmax(190px,1fr)_minmax(180px,1fr)_auto]`}><span className="pt-1"><span className="block text-[10px] uppercase tracking-wider text-slate-600">Rank</span><span className="mt-1 block text-xl font-semibold text-white">{index + 1}</span></span><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(exception.severity)}`}>{exception.severity}</span><span className="text-xs font-semibold text-slate-200">{shipment.loadNumber}</span></span><span className="mt-2 block truncate text-sm font-medium text-white">{exception.title}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{shipment.customer.name} · {shipment.carrier.name}</span></span><span className="min-w-0"><span className="block truncate text-xs text-slate-300">{shipment.origin} → {shipment.destination}</span><span className="mt-1 block text-[11px] capitalize text-slate-600">{statusLabel(shipment.currentStatus)} · ETA {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(shipment.eta))}</span><span className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><Clock3 size={12} /> Last contact {relative(shipment.lastCarrierContact)}</span></span><span className="min-w-0"><span className="block text-[10px] uppercase tracking-wider text-slate-600">Next action</span><span className="mt-1 block text-xs font-medium text-cyan-300">{exception.recommendedAction}</span><span className="mt-2 block text-[10px] text-slate-500">{action ?? `Owner: ${owner}`}</span></span><span className="flex items-start justify-between gap-3 lg:block lg:text-right"><span className="flex items-center gap-1 text-[10px] text-slate-500 lg:justify-end"><Clock3 size={12} /> {relative(exception.dueAt)}</span><span className="mt-2 block font-mono text-xs text-slate-500 lg:text-right">{score} pts</span><ChevronRight size={15} className="mt-2 ml-auto text-slate-600" /></span></button>; })}{ranked.length === 0 && <div className="p-12 text-center"><CheckCircle2 className="mx-auto text-emerald-400" size={28} /><p className="mt-3 text-sm text-slate-300">Queue clear.</p><p className="mt-1 text-xs text-slate-600">No unresolved work matches your search.</p></div>}</div></div>
            <aside className="rounded border border-white/10 bg-[#11161c]"><div className="border-b border-white/10 px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Why this is priority #1</p><h2 className="mt-2 text-lg font-semibold text-white">{top?.shipment?.loadNumber ?? "Queue clear"}</h2><p className="mt-1 text-xs text-slate-500">{top?.exception.title ?? "No item needs intervention."}</p></div>{top?.shipment && <div className="space-y-5 p-5"><div className="rounded border border-red-400/20 bg-red-400/[0.06] p-4"><div className="flex gap-3"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-red-300" /><div><p className="text-xs font-semibold text-red-200">Impact if untouched</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Delivery ETA cannot be confirmed before the customer update SLA. The next appointment window may be missed.</p></div></div></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Auditable score breakdown</p><div className="mt-3 space-y-3">{priorityBreakdown(top.exception, top.shipment).factors.slice(0, 6).map((factor) => <div key={factor.label} className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-300">{factor.label}</p><p className="mt-0.5 text-[10px] text-slate-600">{factor.detail}</p></div><span className="font-mono text-xs text-amber-200">+{factor.points}</span></div>)}</div></div><div className="border-t border-white/10 pt-4"><p className="text-[10px] uppercase tracking-wider text-slate-600">Recommended sequence</p><p className="mt-2 text-xs leading-relaxed text-slate-300">{top.exception.recommendedAction}. If unanswered after 10 minutes, escalate to carrier relations.</p></div></div>}</aside>
          </section>

          {selected?.shipment && <QueueDetail exception={selected.exception} shipment={selected.shipment} owner={owners[selected.exception.id] ?? selected.exception.owner} onAction={update} onClose={() => setSelectedId(null)} />}
          {toast && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded border border-emerald-400/30 bg-[#151b22] px-4 py-3 text-xs text-emerald-300 shadow-2xl"><Check size={15} /> {toast}</div>}
        </main>
      </div>
    </div>
  );
}

function QueueDetail({ exception, shipment, owner, onAction, onClose }: { exception: Exception; shipment: Shipment; owner: string; onAction: (action: QueueAction) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 sm:items-center"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-white/15 bg-[#151b22] shadow-2xl"><div className="flex items-start justify-between border-b border-white/10 p-5"><div><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(exception.severity)}`}>{exception.severity} priority</span><h2 className="mt-3 text-xl font-semibold text-white">{shipment.loadNumber} · {exception.title}</h2><p className="mt-1 text-xs text-slate-500">{shipment.customer.name} · {shipment.carrier.name} · {shipment.origin} → {shipment.destination}</p></div><button onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Close queue item"><X size={18} /></button></div><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-4"><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Current status</p><p className="mt-1 text-xs capitalize text-slate-200">{statusLabel(shipment.currentStatus)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Appointment</p><p className="mt-1 text-xs text-slate-200">{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(shipment.deliveryAppointment))}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Last ping</p><p className="mt-1 text-xs text-slate-200">{relative(shipment.lastTrackingUpdate)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Owner</p><p className="mt-1 text-xs text-slate-200">{owner}</p></div></div><div className="rounded border border-cyan-400/20 bg-cyan-400/[0.05] p-4"><p className="text-[10px] uppercase tracking-wider text-cyan-300">Recommended next action</p><p className="mt-2 text-sm text-slate-200">{exception.recommendedAction}</p><p className="mt-2 text-xs text-slate-500">Secondary: escalate to carrier relations if unanswered after 10 minutes.</p></div><div><p className="mb-3 text-[10px] uppercase tracking-wider text-slate-600">Operator actions</p><div className="grid gap-2 sm:grid-cols-2">{[["contacted", Phone, "Mark contacted"], ["response", MessageSquare, "Log carrier response"], ["eta", RotateCcw, "Update ETA"], ["customer", Send, "Send customer update"], ["snooze", Timer, "Snooze 30 minutes"], ["escalate", ShieldAlert, "Escalate"], ["reassign", UserRound, "Reassign"], ["resolved", CheckCircle2, "Mark resolved"]].map(([action, Icon, label]) => <button key={action as string} onClick={() => onAction(action as QueueAction)} className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left text-xs text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] hover:text-cyan-200"><Icon size={15} />{label as string}</button>)}</div></div></div></div></div>;
}
