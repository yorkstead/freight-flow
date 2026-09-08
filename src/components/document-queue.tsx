"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleDot,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Search,
  Settings,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import type { Document, Shipment } from "@/lib/domain";
import { buildDocumentQueue, documentAutomationRules, type DocumentQueueItem } from "@/lib/document-queue";

const stages = ["Delivered", "POD Pending", "Documents Received", "Verification Required", "Billing Ready", "Invoiced"];
const filters = ["All", "POD", "Signed BOL", "Lumper receipt", "Accessorial approval", "Customer requirement"];

export function DocumentQueue({ shipments, documents }: { shipments: Shipment[]; documents: Document[] }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const queue = useMemo(() => buildDocumentQueue(shipments, documents), [shipments, documents]);
  const filtered = useMemo(() => queue.filter((item) => {
    const matchesFilter = filter === "All" || item.needed === filter || item.bucket === filter;
    const query = search.toLowerCase();
    return matchesFilter && (!query || `${item.shipment.loadNumber} ${item.carrier} ${item.shipment.customer.name}`.toLowerCase().includes(query));
  }), [filter, queue, search]);
  const blockedRevenue = queue.reduce((sum, item) => sum + item.amount, 0);
  const counts = {
    pod: queue.filter((item) => item.bucket === "POD missing").length,
    accessorial: queue.filter((item) => item.bucket === "Accessorial approval").length,
    verification: queue.filter((item) => item.bucket === "Verification").length,
    customer: queue.filter((item) => item.bucket === "Customer requirement").length,
  };

  return (
    <Shell active="Documents">
      <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Billing readiness</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">Documents</h1>
            <p className="mt-2 text-sm text-slate-500">Prevent delivered freight from disappearing into a document chase.</p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded border border-white/10 bg-[#11161c] px-3 text-xs text-slate-500">
            <Search size={14} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search load, carrier, customer" className="w-52 bg-transparent outline-none placeholder:text-slate-600" />
          </label>
        </div>

        <section className="rounded border border-white/10 bg-[#11161c] p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Billing readiness pipeline</h2>
              <p className="mt-1 text-xs text-slate-500">Every delivered load should move left to right without manual status hunting.</p>
            </div>
            <span className="hidden text-[10px] uppercase tracking-wider text-slate-600 sm:block">Live demo queue</span>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {stages.map((stage, index) => (
              <div key={stage} className={`relative rounded border p-3 ${index === 1 || index === 2 || index === 3 ? "border-orange-400/25 bg-orange-400/[0.05]" : "border-white/10 bg-white/[0.02]"}`}>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-xs font-medium text-white">{stage}</p>
                <p className={`mt-1 text-[10px] ${index === 1 || index === 2 || index === 3 ? "text-orange-300" : "text-slate-600"}`}>{index < 4 ? `${index === 0 ? shipments.filter((item) => item.currentStatus === "delivered").length : queue.filter((item) => item.stage === stage).length} loads` : "workflow state"}</p>
                {index < stages.length - 1 && <ChevronRight size={14} className="absolute -right-3 top-1/2 z-10 hidden text-slate-700 xl:block" />}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Revenue blocked" value={currency(blockedRevenue)} detail="delivered, not billing-ready" tone="red" />
          <Metric label="POD missing" value={counts.pod} detail="carrier follow-up required" tone="amber" />
          <Metric label="Accessorial approval" value={counts.accessorial} detail="supporting charge evidence" />
          <Metric label="Verification / customer" value={counts.verification + counts.customer} detail={`${counts.verification} verification · ${counts.customer} customer`} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded border px-3 py-2 text-[10px] font-medium ${filter === item ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-slate-500 hover:text-slate-300"}`}>{item}</button>)}
            </div>
            <div className="overflow-hidden rounded border border-white/10 bg-[#11161c]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div><h2 className="text-sm font-semibold text-white">Document queue</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} items blocking or delaying invoice readiness</p></div>
                <FileCheck2 size={18} className="text-orange-300" />
              </div>
              <div className="divide-y divide-white/[0.07]">
                {filtered.map((item) => <QueueRow key={item.id} item={item} />)}
                {!filtered.length && <div className="p-8 text-center text-xs text-slate-500">No document work matches this filter.</div>}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded border border-orange-400/25 bg-orange-400/[0.05] p-5">
              <div className="flex items-start gap-3"><AlertTriangle size={18} className="mt-0.5 text-orange-300" /><div><p className="text-[10px] uppercase tracking-wider text-orange-300">Revenue at risk</p><p className="mt-2 text-2xl font-semibold text-white">{currency(blockedRevenue)}</p><p className="mt-1 text-xs leading-5 text-slate-400">Delivered freight waiting on a document, approval, or verification before invoicing.</p></div></div>
              <div className="mt-5 space-y-3 border-t border-orange-300/10 pt-4 text-xs"><Breakdown label="POD missing" value={counts.pod} /><Breakdown label="Accessorial approval" value={counts.accessorial} /><Breakdown label="Verification" value={counts.verification} /><Breakdown label="Customer requirement" value={counts.customer} /></div>
            </section>
            <section className="rounded border border-white/10 bg-[#11161c] p-5">
              <div className="flex items-start gap-3"><Zap size={16} className="mt-0.5 text-cyan-300" /><div><h2 className="text-sm font-semibold text-white">Automatic follow-up rules</h2><p className="mt-1 text-xs leading-5 text-slate-500">Visible thresholds keep the automation auditable. No machine learning is implied.</p></div></div>
              <div className="mt-4 space-y-4">{documentAutomationRules.map((rule, index) => <div key={rule.threshold} className="relative pl-6 text-xs"><span className="absolute left-0 top-0.5 grid h-4 w-4 place-items-center rounded-full border border-cyan-400/30 text-[9px] text-cyan-300">{index + 1}</span><p className="font-medium text-slate-200">POD pending {rule.threshold} <span className="text-cyan-300">→ {rule.action}</span></p><p className="mt-1 leading-5 text-slate-600">{rule.detail}</p></div>)}</div>
            </section>
          </aside>
        </section>
      </main>
    </Shell>
  );
}

function QueueRow({ item }: { item: DocumentQueueItem }) {
  const statusTone = item.followUp === "Carrier relations queue" ? "text-red-300 bg-red-400/10 border-red-400/20" : item.followUp === "Escalate now" ? "text-orange-300 bg-orange-400/10 border-orange-400/20" : item.followUp === "Verify documents" ? "text-cyan-300 bg-cyan-400/10 border-cyan-400/20" : "text-slate-300 bg-white/5 border-white/10";
  return <div className="p-5 transition hover:bg-white/[0.02]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/loads/${item.shipment.id}`} className="font-mono text-sm font-semibold text-cyan-300 hover:text-cyan-200">{item.shipment.loadNumber}</Link><span className={`rounded border px-2 py-1 text-[9px] uppercase tracking-wider ${statusTone}`}>{item.followUp}</span></div><p className="mt-2 text-xs text-white">{item.needed} <span className="text-slate-600">· {item.stage}</span></p><p className="mt-1 text-[11px] text-slate-500">{item.carrier} · {item.shipment.customer.name}</p></div>
      <div className="text-right"><p className="font-mono text-sm text-white">{currency(item.amount)}</p><p className="mt-1 text-[10px] text-slate-600">waiting to invoice</p></div>
    </div>
    <div className="mt-4 grid gap-3 border-t border-white/[0.07] pt-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4"><Info label="Delivered" value={formatDate(item.deliveredAt)} /><Info label="Age" value={`${item.ageHours}h`} /><Info label="Owner" value={item.owner} /><Info label="Last contact" value={relativeTime(item.lastContact)} /></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"><p className="text-[11px] text-slate-400"><span className="mr-2 uppercase tracking-wider text-[9px] text-cyan-300">Recommended</span>{item.recommendedAction}</p><Link href={`/loads/${item.shipment.id}`} className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-300">Open load <ArrowUpRight size={12} /></Link></div>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 truncate text-slate-300">{value}</p></div>; }
function Breakdown({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between"><span className="text-slate-400">{label}</span><span className="font-mono text-white">{value}</span></div>; }
function Metric({ label, value, detail, tone = "cyan" }: { label: string; value: number | string; detail: string; tone?: "cyan" | "amber" | "red" }) { return <div className="rounded border border-white/10 bg-[#11161c] p-4"><p className={`text-[10px] uppercase tracking-wider ${tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-200" : "text-cyan-300"}`}>{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-slate-600">{detail}</p></div>; }
function currency(value: number) { return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`; }
function formatDate(value: string) { return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function relativeTime(value: string) { const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3_600_000)); return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`; }

const nav = [["Control Tower", LayoutDashboard, "/"], ["My Queue", Zap, "/my-queue"], ["Loads", PackageSearch, "#"], ["Exceptions", AlertTriangle, "#"], ["Carriers", Truck, "/carriers"], ["Documents", FileText, "/documents"], ["Customers", Users, "#"], ["Analytics", CircleDot, "#"], ["Settings", Settings, "/settings/automation-rules"]] as const;
function Shell({ active, children }: { active: string; children: React.ReactNode }) { return <div className="min-h-screen bg-[#0b0e12] text-slate-100"><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#101419] lg:flex"><div className="flex h-20 items-center border-b border-white/10 px-5"><div className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white"><span className="grid h-7 w-7 place-items-center rounded bg-cyan-400 text-[#071014]"><Zap size={15} fill="currentColor" /></span>FREIGHTFLOW</div></div><nav className="space-y-1 px-3 py-5">{nav.map(([label, Icon, href]) => <Link key={label} href={href} className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm ${active === label ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5"}`}><Icon size={17} /><span>{label}</span></Link>)}</nav><div className="mt-auto border-t border-white/10 p-4 text-xs text-slate-500">Maya Chen · Dispatcher</div></aside><div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8"><button className="text-slate-400 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><Link href="/">Control Tower</Link><ChevronRight size={13} /><span className="text-slate-200">{active}</span></div><div className="ml-auto"><Bell size={18} className="text-slate-400" /></div></header>{children}</div></div>; }
