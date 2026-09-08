"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  FileText,
  LayoutDashboard,
  Menu,
  PackageSearch,
  PanelLeftClose,
  Search,
  Settings,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { Exception, Shipment } from "@/lib/domain";
import { prioritizedExceptions } from "@/lib/rules";

const navItems = [
  ["Control Tower", LayoutDashboard],
  ["My Queue", Zap],
  ["Loads", PackageSearch],
  ["Exceptions", AlertTriangle],
  ["Carriers", Truck],
  ["Documents", FileText],
  ["Customers", Users],
  ["Analytics", CircleDot],
  ["Settings", Settings],
] as const;

function formatRelative(date: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
}

function severityClass(severity: Exception["severity"]) {
  return {
    critical: "border-red-400/40 bg-red-400/10 text-red-300",
    high: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    medium: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    low: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  }[severity];
}

export function ControlTower({
  shipments,
  exceptions,
}: {
  shipments: Shipment[];
  exceptions: Exception[];
}) {
  const [activeNav, setActiveNav] = useState("Control Tower");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<string | null>(null);
  const prioritized = useMemo(() => prioritizedExceptions(exceptions, shipments), [exceptions, shipments]);
  const selected = prioritized.find((item) => item.exception.id === selectedException);
  const criticalCount = exceptions.filter((item) => item.severity === "critical").length;
  const healthyCount = shipments.filter((shipment) => shipment.riskScore < 45).length;
  const staleCount = shipments.filter((shipment) => shipment.trackingState === "stale").length;

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#101419] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white">
              <span className="grid h-7 w-7 place-items-center rounded bg-cyan-400 text-[#071014]"><Zap size={15} fill="currentColor" /></span>
              FREIGHTFLOW
            </div>
            <p className="mt-1 pl-9 text-[10px] uppercase tracking-[0.24em] text-slate-500">Control tower</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Operations</p>
          <nav className="space-y-1">
            {navItems.map(([label, Icon]) => (
              <button key={label} onClick={() => { setActiveNav(label); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition ${activeNav === label ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
                <Icon size={17} strokeWidth={1.7} />
                <span>{label}</span>
                {label === "Exceptions" && <span className="ml-auto rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">{exceptions.length}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded bg-white/[0.03] p-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-300">MC</div>
            <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">Maya Chen</p><p className="text-[10px] text-slate-500">Dispatcher · East desk</p></div>
            <PanelLeftClose size={14} className="ml-auto text-slate-600" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="rounded p-2 text-slate-400 hover:bg-white/5 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><span className="text-slate-200">{activeNav}</span><ChevronRight size={13} /><span>Tuesday, Sep 8, 2026</span></div>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden h-9 items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-500 sm:flex"><Search size={14} /> Search loads <kbd className="ml-4 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600"><Command size={10} /></kbd><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600">K</kbd></button>
            <button className="relative rounded p-2 text-slate-400 hover:bg-white/5" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" /></button>
            <span className="hidden rounded border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:block">Demo mode</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Operations overview</p><h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">Good morning, Maya.</h1><p className="mt-2 text-sm text-slate-500">Work the loads that need you. <span className="text-slate-300">{exceptions.length} active exceptions</span> require an owner today.</p></div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />Data synced 2 min ago <ArrowUpRight size={14} /></div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Active shipments", String(shipments.length), "Across 20 carriers", "text-white"],
              ["Needs action", String(exceptions.length), `${criticalCount} critical · ${staleCount} stale`, "text-red-300"],
              ["Healthy / on plan", String(healthyCount), `${Math.round((healthyCount / shipments.length) * 100)}% of active network`, "text-emerald-300"],
              ["At risk revenue", "$184.2k", "12 loads · $22.8k margin", "text-amber-200"],
            ].map(([label, value, detail, color]) => <div key={label} className="rounded border border-white/10 bg-[#11161c] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className={`mt-3 text-2xl font-semibold tracking-tight ${color}`}>{value}</p><p className="mt-1 text-xs text-slate-600">{detail}</p></div>)}
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 rounded border border-white/10 bg-[#11161c]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Priority queue</h2><p className="mt-1 text-xs text-slate-500">Ranked by severity, due time, tracking freshness, and customer SLA.</p></div><button className="flex items-center gap-1.5 rounded border border-white/10 px-3 py-2 text-xs text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300">View full queue <ArrowUpRight size={13} /></button></div>
              <div className="divide-y divide-white/[0.07]">
                {prioritized.slice(0, 7).map(({ exception, shipment, score }, index) => <button key={exception.id} onClick={() => setSelectedException(exception.id)} className={`grid w-full grid-cols-[28px_minmax(0,1fr)_auto] gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03] ${selectedException === exception.id ? "bg-cyan-400/[0.05]" : ""}`}>
                  <span className="pt-0.5 text-xs font-mono text-slate-600">0{index + 1}</span>
                  <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(exception.severity)}`}>{exception.severity}</span><span className="truncate text-sm font-medium text-slate-200">{exception.title}</span></span><span className="mt-1.5 block truncate text-xs text-slate-500">{shipment?.loadNumber} · {shipment?.origin} → {shipment?.destination}</span><span className="mt-2 flex items-center gap-3 text-[11px] text-slate-600"><span className="flex items-center gap-1"><Clock3 size={12} /> Due {formatRelative(exception.dueAt)}</span><span>Owner: {exception.owner}</span></span></span>
                  <span className="flex items-center gap-2 pt-1 text-xs font-mono text-slate-500">{score}<ChevronRight size={15} /></span>
                </button>)}
              </div>
            </div>
            <div className="rounded border border-white/10 bg-[#11161c]">
              <div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Network pulse</h2><p className="mt-1 text-xs text-slate-500">Signals that change the workday.</p></div>
              <div className="space-y-5 p-5">
                <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Tracking compliance</span><span className="font-mono text-emerald-300">92.4%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[92%] rounded-full bg-emerald-400" /></div></div>
                <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">On-time delivery forecast</span><span className="font-mono text-cyan-300">88.7%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[89%] rounded-full bg-cyan-400" /></div></div>
                <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">POD within 12 hours</span><span className="font-mono text-amber-200">76.1%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[76%] rounded-full bg-amber-300" /></div></div>
                <div className="border-t border-white/10 pt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Latest signal</p><div className="mt-3 flex gap-3"><div className="mt-0.5 text-amber-300"><AlertTriangle size={16} /></div><div><p className="text-xs font-medium text-slate-300">3 loads trending late into Atlanta</p><p className="mt-1 text-[11px] leading-relaxed text-slate-600">Weather watch · I-20 corridor · Review appointment risk queue</p></div></div></div>
              </div>
            </div>
          </section>

          {selected && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setSelectedException(null)}><div className="w-full max-w-lg rounded border border-white/15 bg-[#151b22] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between border-b border-white/10 p-5"><div><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityClass(selected.exception.severity)}`}>{selected.exception.severity} priority</span><h2 className="mt-3 text-lg font-semibold text-white">{selected.exception.title}</h2><p className="mt-1 text-xs text-slate-500">{selected.shipment?.loadNumber} · {selected.shipment?.customer.name}</p></div><button onClick={() => setSelectedException(null)} className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Close exception details"><X size={18} /></button></div><div className="space-y-5 p-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Why it is prioritized</p><p className="mt-2 text-sm leading-relaxed text-slate-300">{selected.exception.description} This item is ranked {selected.score} based on severity, due time, and the customer service level.</p></div><div className="rounded border border-cyan-400/20 bg-cyan-400/[0.05] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Recommended next action</p><p className="mt-2 text-sm text-slate-200">{selected.exception.recommendedAction}</p></div><div className="flex items-center justify-between text-xs text-slate-500"><span>Owner: <span className="text-slate-300">{selected.exception.owner}</span></span><span className="flex items-center gap-1"><Clock3 size={13} /> Due {formatRelative(selected.exception.dueAt)}</span></div><button className="flex w-full items-center justify-center gap-2 rounded bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#071014] hover:bg-cyan-300"><CheckCircle2 size={16} /> Mark in progress</button></div></div></div>}
        </main>
      </div>
    </div>
  );
}

