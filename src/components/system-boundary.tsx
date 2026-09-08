import { ArrowRight, Database } from "lucide-react";

export function SystemBoundary() {
  return (
    <section className="mb-6 flex flex-wrap items-start gap-3 rounded border border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-3">
      <Database size={16} className="mt-0.5 shrink-0 text-cyan-300" />
      <div className="min-w-0 text-xs leading-5">
        <p className="font-medium text-cyan-200">FreightFlow is the operational intelligence layer</p>
        <p className="text-slate-400">
          The TMS remains the system of record for loads, contracts, customer master data, and accounting.
          FreightFlow consumes those records and surfaces <span className="text-slate-200">what needs attention</span>,
          <span className="text-slate-200"> who should act</span>, and <span className="text-slate-200">whether it was resolved</span>.
        </p>
      </div>
      <ArrowRight size={14} className="mt-1 hidden text-cyan-400/60 sm:block" />
      <p className="text-[10px] uppercase tracking-wider text-cyan-300/80">Visibility · exceptions · action</p>
    </section>
  );
}
