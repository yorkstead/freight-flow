"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
export const destinations = [["Control Tower", "/"], ["My Queue", "/my-queue"], ["Loads", "/loads"], ["Carriers", "/carriers"], ["Documents", "/documents"], ["Customer updates", "/customer-updates"], ["Analytics", "/analytics"], ["Executive", "/executive"], ["Settings", "/settings/automation-rules"], ["Guided demo", "/demo-story"]];
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return <><button aria-label="Open navigation" onClick={() => setOpen(true)} className="p-2 text-slate-300 lg:hidden"><Menu size={20} /></button>{open && createPortal(<div role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-0 z-50 overflow-y-auto bg-[#101419] p-5 text-slate-100 lg:hidden"><div className="mb-5 flex items-center justify-between"><span className="font-semibold">FreightFlow</span><button aria-label="Close navigation" onClick={() => setOpen(false)} className="p-2"><X /></button></div><nav className="grid gap-2">{destinations.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-white/10">{label}</Link>)}</nav></div>, document.body)}</>;
}
