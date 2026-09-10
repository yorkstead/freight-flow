"use client";
import { useDemoSession, dispatchDemo } from "@/components/demo-session";
import { ArrowRight, Database } from "lucide-react";

export function SystemBoundary() {
  const shared = useDemoSession();
  return (
    <section className="mb-6 flex flex-wrap items-start gap-3 rounded border border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-3">
      <Database size={16} className="mt-0.5 shrink-0 text-cyan-300" />
      <div className="min-w-0 text-xs leading-5">
        <p className="font-medium text-cyan-200">King of Freight · Concept prototype</p>
        <p className="text-slate-400">
          The TMS remains the system of record for loads, contracts, customer master data, and accounting.
          This fictional demonstration shows how FreightFlow could surface <span className="text-slate-200">what needs attention</span>,
          <span className="text-slate-200"> who should act</span>, and <span className="text-slate-200">whether it was resolved</span>.
        </p>
      </div>
      <ArrowRight size={14} className="mt-1 hidden text-cyan-400/60 sm:block" />
      <p className="text-[10px] uppercase tracking-wider text-cyan-300/80">Synthetic data · fixed Sep 8 scenario · saved in this tab</p>
      <button onClick={() => dispatchDemo({ type: "reset" })} className="text-xs text-cyan-300 underline">Reset demo session</button>
      {shared.storageError && <p role="alert" className="text-xs text-amber-300">Browser storage unavailable. Changes will not survive reload.</p>}
    </section>
  );
}
