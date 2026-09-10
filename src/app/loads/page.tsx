"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemoSession } from "@/components/demo-session";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SystemBoundary } from "@/components/system-boundary";
export default function LoadsPage() {
  const { shipments } = useDemoSession();
  const [search, setSearch] = useState("");
  return <main className="mx-auto max-w-6xl p-4 sm:p-8"><header className="mb-6 flex items-center gap-3"><MobileNavigation /><Link href="/" className="text-cyan-300">Control Tower</Link></header><SystemBoundary /><h1 className="text-3xl font-semibold">Loads</h1><label className="my-5 block text-sm">Find a demo load<input value={search} onChange={event => setSearch(event.target.value)} className="mt-2 block w-full rounded border border-white/20 bg-[#11161c] p-3" placeholder="Load, customer, carrier or city" /></label><div className="grid gap-3 sm:grid-cols-2">{shipments.filter(s => [s.loadNumber,s.customer.name,s.carrier.name,s.origin,s.destination].some(value => value.toLowerCase().includes(search.toLowerCase()))).map(s => <Link key={s.id} href={`/loads/${s.id}`} className="min-w-0 rounded border border-white/10 p-4 hover:border-cyan-400"><strong>{s.loadNumber}</strong><p className="mt-2 break-words text-sm">{s.origin} → {s.destination}</p><p className="mt-2 text-xs text-slate-400">{s.customer.name} · POD {s.podStatus}</p></Link>)}</div></main>;
}
