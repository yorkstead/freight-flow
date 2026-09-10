"use client";
import { useDemoSession } from "@/components/demo-session";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronRight,
  Play,
  Zap,
} from "lucide-react";

const stages = [
  {
    number: "01",
    title: "The Problem",
    eyebrow: "Start with the work, not the software",
    copy: "Your dispatchers should not spend the morning checking every load to discover which ones have problems. The system of record can hold the data while the operation still loses time finding the work.",
    outcome: "FreightFlow turns shipment data into an operational worklist.",
    href: "/",
    label: "Open the Control Tower",
    metric: "75 active loads",
    detail: "A traditional operation requires repeated status review.",
  },
  {
    number: "02",
    title: "The Control Tower",
    eyebrow: "Make attention visible",
    copy: "The team does not need another screen full of loads. It needs a clear answer to what changed, who owns the next action, and what happens if nobody acts.",
    outcome: "Only the loads needing human attention rise to the top.",
    href: "/",
    label: "See the attention queue",
    metric: "9 need attention",
    detail: "The rest can continue without manual hunting.",
  },
  {
    number: "03",
    title: "Exception Detection",
    eyebrow: "Catch the signal before the phone call",
    copy: "A carrier tracking update goes stale. Nobody has to remember to compare timestamps or wait for a customer to ask where the truck is.",
    outcome: "An explicit rule identifies the risk and recommends the next action.",
    href: "/settings/automation-rules",
    label: "Inspect the rules",
    metric: "Tracking stale",
    detail: "Verify driver location before the appointment buffer disappears.",
  },
  {
    number: "04",
    title: "Prioritized Queue",
    eyebrow: "Put the right work first",
    copy: "The stale load does not become another item in a flat task list. Severity, appointment proximity, tracking age, customer SLA, and carrier reliability determine its place in the queue.",
    outcome: "The dispatcher starts with the problem most likely to create service failure.",
    href: "/my-queue",
    label: "Open My Queue",
    metric: "Priority #1",
    detail: "The score is explicit and auditable, not fake AI.",
  },
  {
    number: "05",
    title: "Shipment Context",
    eyebrow: "Explain why this load is at risk",
    copy: "Before calling, the operator can see the complete operational story: last ping, carrier contact, appointment, ETA buffer, exception history, documents, and timeline.",
    outcome: "The next conversation starts with context instead of a blank shipment screen.",
    href: "/loads/shipment-1",
    label: "Open shipment context",
    metric: "One operational story",
    detail: "Every event is connected to the decision the operator needs to make.",
  },
  {
    number: "06",
    title: "Carrier Intelligence",
    eyebrow: "Know the pattern behind the exception",
    copy: "A stale update is more useful when the team can see the carrier's response time, tracking compliance, exception rate, and recurring lanes.",
    outcome: "Carrier performance explains where human effort is accumulating.",
    href: "/carriers/carrier-1",
    label: "Open carrier intelligence",
    metric: "Response history",
    detail: "Component metrics show why a partner creates work.",
  },
  {
    number: "07",
    title: "Customer Communication",
    eyebrow: "Automate routine. Review risk.",
    copy: "A routine checkpoint can be sent automatically. A potential service failure becomes a draft for broker approval. A critical failure escalates to the broker and operations manager.",
    outcome: "Customers hear from the operation before they have to chase it.",
    href: "/customer-updates",
    label: "Preview the update",
    metric: "Automatic or approved",
    detail: "The mode and message are visible before anything is sent.",
  },
  {
    number: "08",
    title: "Resolution",
    eyebrow: "Let the operation respond",
    copy: "The carrier answers. The operator logs the response and updates the ETA. The system does not keep treating a resolved problem as open work.",
    outcome: "One response changes the state of the work everywhere it matters.",
    href: "/my-queue",
    label: "Return to the queue",
    metric: "Carrier response received",
    detail: "The queue is ready to reprioritize.",
  },
  {
    number: "09",
    title: "Automatic Recovery",
    eyebrow: "Recovery should be visible too",
    copy: "The exception resolves and the load falls out of the urgent queue. The team can see what recovered instead of carrying yesterday's risk into today's workload.",
    outcome: "Operational intelligence surfaces recovery, not just failure.",
    href: "/",
    label: "See the operating view",
    metric: "Queue reprioritized",
    detail: "The next highest-impact item becomes the next action.",
  },
  {
    number: "10",
    title: "Documents",
    eyebrow: "Do not lose the load after delivery",
    copy: "Another load is delivered but waiting on a POD. That is not administrative noise: revenue remains blocked until the document is received and verified.",
    outcome: "The document chase becomes a visible billing-readiness pipeline.",
    href: "/documents",
    label: "Open Documents",
    metric: "Revenue awaiting POD",
    detail: "Follow-up thresholds are visible at 12, 24, and 48 hours.",
  },
  {
    number: "11",
    title: "Analytics",
    eyebrow: "Turn friction into a management signal",
    copy: "Repeated exceptions become measurable: intervention per load, queue aging, high-friction lanes, carrier response patterns, documentation blockage, and modeled labor exposure.",
    outcome: "Leaders can identify the workflow worth fixing first.",
    href: "/analytics",
    label: "Open Operations Analytics",
    metric: "Friction measured",
    detail: "Drill down from a signal into the affected loads.",
  },
  {
    number: "12",
    title: "Executive View",
    eyebrow: "Know whether the operation is under control",
    copy: "The leadership question is not whether the dashboard looks busy. It is whether pressure is contained, customers are protected, and revenue is moving toward billing.",
    outcome: "FreightFlow makes the operational state legible to the people accountable for it.",
    href: "/executive",
    label: "Open Executive Cockpit",
    metric: "Under-control view",
    detail: "A management cockpit without duplicating dispatcher work.",
  },
] as const;

export function DemoStory() {
  const shared = useDemoSession();
  const [active, setActive] = useState(0);
  const stage = stages[active];
  const progress = useMemo(() => `${((active + 1) / stages.length) * 100}%`, [active]);

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e12]/95 px-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white"><span className="grid h-7 w-7 place-items-center rounded bg-cyan-400 text-[#071014]"><Zap size={15} fill="currentColor" /></span>FREIGHTFLOW</Link>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-xs text-slate-400">Guided Demo Story</span>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-[10px] uppercase tracking-wider text-slate-600 sm:block">Presentation mode</span><Bell size={17} className="text-slate-500" /></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div><Link href="/" className="mb-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-cyan-300"><ArrowLeft size={12} /> Back to Control Tower</Link><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Yorkstead Systems / solutions story</p><h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">Find the workflow worth fixing first.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">A King of Freight concept discussion using fictional data. Validate the workflow around the existing TMS before quoting integration.</p></div>
          <div className="w-full max-w-xs"><div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-600"><span>Stage {active + 1} of {stages.length}</span><span>{Math.round(((active + 1) / stages.length) * 100)}%</span></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: progress }} /></div></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
          <nav className="rounded border border-white/10 bg-[#11161c] p-3"><p className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">The story</p><div className="grid gap-1">{stages.map((item, index) => <button key={item.number} onClick={() => setActive(index)} className={`flex items-center gap-3 rounded px-2.5 py-2 text-left text-xs transition ${index === active ? "bg-cyan-400/10 text-cyan-300" : index < active ? "text-slate-500 hover:bg-white/[0.03]" : "text-slate-400 hover:bg-white/[0.03]"}`}><span className="w-5 font-mono text-[10px]">{index < active ? "✓" : item.number}</span><span className="truncate">{item.title}</span></button>)}</div></nav>

          <section className="rounded border border-white/10 bg-[#11161c]">
            <div className="border-b border-white/10 px-5 py-4 lg:px-8"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">{stage.eyebrow}</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><h2 className="text-2xl font-semibold text-white lg:text-4xl">{stage.title}</h2><span className="font-mono text-3xl font-semibold text-cyan-300">{stage.number}</span></div></div>
            <div className="grid gap-8 p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8"><div><p className="max-w-2xl text-lg leading-8 text-slate-200">{stage.copy}</p><div className="mt-7 rounded border border-cyan-400/20 bg-cyan-400/[0.04] p-5"><p className="text-[10px] uppercase tracking-wider text-cyan-300">What changes</p><p className="mt-2 text-sm leading-6 text-slate-300">{stage.outcome}</p></div><div className="mt-8 flex flex-wrap items-center gap-3"><Link href={stage.href} className="flex items-center gap-2 rounded bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#071014] hover:bg-cyan-300"><Play size={14} /> {stage.label}</Link><button onClick={() => setActive((value) => Math.min(stages.length - 1, value + 1))} className="flex items-center gap-2 rounded border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200">Next stage <ArrowRight size={14} /></button></div></div><aside className="rounded border border-white/10 bg-[#0d1217] p-5"><p className="text-[10px] uppercase tracking-wider text-slate-600">Presenter cue</p><p className="mt-4 text-2xl font-semibold text-white">{active === 0 ? `${shared.shipments.filter(s => s.currentStatus !== "closed").length} active demo loads` : active === 1 ? `${shared.exceptions.filter(e => e.status !== "resolved" && e.status !== "snoozed").length} need attention` : stage.metric}</p><p className="mt-2 text-xs leading-5 text-slate-500">{stage.detail}</p><div className="mt-7 border-t border-white/10 pt-4 text-[10px] leading-5 text-slate-600">Keep the conversation on the operational outcome: less hunting, earlier intervention, clearer ownership.</div></aside></div>
          </section>
        </div>

        <section className="mt-8 rounded border border-cyan-400/25 bg-cyan-400/[0.05] p-6 lg:p-8"><div className="max-w-3xl"><p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">The FreightFlow position</p><p className="mt-4 text-xl font-medium leading-8 text-white lg:text-2xl">The TMS remains the system of record.<br />FreightFlow makes the work around it manageable.</p><Link href="/executive" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Find the workflow worth fixing first <ArrowRight size={14} /></Link></div></section>
        <section className="mt-6 rounded border border-white/15 bg-[#11161c] p-6">
          <p className="text-xs uppercase tracking-wider text-cyan-300">Proposed first engagement</p>
          <h2 className="mt-2 text-2xl font-semibold">$1,000 upfront · Validate one exception or POD workflow</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Review approved sample exports, map the current handoff and demonstrate one agreed workflow. Deliver a findings note, acceptance checklist and a separately priced integration scope. Includes one review meeting and one revision within the agreed scope.</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">Signed scope and payment reserve the work; dates depend on sample-data access and buyer availability. Live TMS access, messaging, production deployment, hardware and ongoing support are excluded. No implementation price or measured savings is committed by this concept.</p>
          <p className="mt-3 text-sm text-slate-300">Discovery question: where does the current TMS still require manual chasing, and who owns that handoff?</p>
        </section>
      </main>
    </div>
  );
}
