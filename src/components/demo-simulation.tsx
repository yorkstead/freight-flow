"use client";
import { dispatchDemo } from "@/components/demo-session";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";

export type DemoSpeed = 0 | 1 | 5 | 15;
export type InjectedException = "stale tracking" | "late pickup" | "late delivery" | "carrier non-response" | "missing POD" | "equipment breakdown";

export const simulatedEvents = [
  "Tracking ping received",
  "Driver arrived at pickup",
  "Load picked up",
  "ETA changed",
  "Carrier missed check-in",
  "Driver stopped unexpectedly",
  "Traffic delay",
  "Delivery appointment endangered",
  "Customer update becomes due",
  "POD received",
  "POD becomes overdue",
  "Carrier responds",
  "Exception resolved",
] as const;

interface DemoContextValue {
  paused: boolean;
  speed: DemoSpeed;
  eventIndex: number;
  lastEvent: string | null;
  injectedException: InjectedException | null;
  setSpeed: (speed: DemoSpeed) => void;
  nextEvent: () => void;
  injectException: (exception: InjectedException) => void;
  reset: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoSimulationProvider({ children }: { children: React.ReactNode }) {
  const [speed, setSpeed] = useState<DemoSpeed>(1);
  const [eventIndex, setEventIndex] = useState(-1);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [injectedException, setInjectedException] = useState<InjectedException | null>(null);
  const paused = speed === 0;

  const nextEvent = useCallback(() => {
    const next = (eventIndex + 1) % simulatedEvents.length;
    setEventIndex(next);
    setLastEvent(simulatedEvents[next]);
  }, [eventIndex]);
  const injectException = useCallback((exception: InjectedException) => {
    setInjectedException(exception);
    dispatchDemo({ type: "inject", title: exception });
    setLastEvent(`Injected: ${exception}`);
  }, []);
  const reset = useCallback(() => {
    dispatchDemo({ type: "reset" });
    setSpeed(1);
    setEventIndex(-1);
    setLastEvent(null);
    setInjectedException(null);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(nextEvent, Math.max(1200, 60000 / speed));
    return () => window.clearInterval(timer);
  }, [nextEvent, paused, speed]);

  const value = useMemo(() => ({ paused, speed, eventIndex, lastEvent, injectedException, setSpeed, nextEvent, injectException, reset }), [paused, speed, eventIndex, lastEvent, injectedException, nextEvent, injectException, reset]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoSimulation() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoSimulation must be used inside DemoSimulationProvider");
  return context;
}

export function DemoControls() {
  const demo = useDemoSimulation();
  const injections: InjectedException[] = ["stale tracking", "late pickup", "late delivery", "carrier non-response", "missing POD", "equipment breakdown"];
  return <details className="group rounded border border-white/10 bg-[#11161c]">
    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300"><Zap size={13} className="text-cyan-300" /> Demo controls <span className="ml-auto text-[9px] text-slate-700">presentation mode</span></summary>
    <div className="border-t border-white/10 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => demo.setSpeed(demo.paused ? 1 : 0)} className="flex items-center gap-1.5 rounded border border-white/10 px-2 py-1.5 text-[10px] text-slate-300 hover:border-cyan-400/30">{demo.paused ? <Play size={12} /> : <Pause size={12} />}{demo.paused ? "Resume" : "Pause"}</button>
        {[1, 5, 15].map((speed) => <button key={speed} onClick={() => demo.setSpeed(speed as DemoSpeed)} className={`rounded border px-2 py-1.5 text-[10px] ${demo.speed === speed ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-slate-500"}`}>{speed}x</button>)}
        <button onClick={demo.nextEvent} className="rounded border border-white/10 px-2 py-1.5 text-[10px] text-slate-300 hover:border-cyan-400/30">Next event</button>
        <button onClick={demo.reset} className="flex items-center gap-1 rounded border border-white/10 px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300"><RotateCcw size={11} /> Reset</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {injections.map((exception) => <button key={exception} onClick={() => demo.injectException(exception)} className="rounded border border-orange-400/20 bg-orange-400/[0.04] px-2 py-1.5 text-[10px] capitalize text-orange-200 hover:bg-orange-400/10">{exception}</button>)}
      </div>
      {demo.lastEvent && <p className="mt-3 border-t border-white/[0.07] pt-2 text-[10px] text-cyan-300">Last event: {demo.lastEvent}</p>}
    </div>
  </details>;
}
