"use client";

import { useSyncExternalStore } from "react";
import { emptySession, readSession, reduceSession, sessionData, type DemoAction } from "@/lib/demo-session";

const key = "freightflow-demo-session-v1";
let session = emptySession;
const initial = { ...sessionData(session), session, storageError: false };
let snapshot = initial;
let loaded = false;
const listeners = new Set<() => void>();
function publish() { listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    try { session = readSession(sessionStorage.getItem(key)); snapshot = { ...sessionData(session), session, storageError: false }; }
    catch { snapshot = { ...initial, storageError: true }; }
    publish();
  }
  return () => { listeners.delete(listener); };
}
export function dispatchDemo(action: DemoAction) {
  session = reduceSession(session, action);
  let storageError = false;
  try { sessionStorage.setItem(key, JSON.stringify(session)); } catch { storageError = true; }
  snapshot = { ...sessionData(session), session, storageError };
  publish();
}
export function useDemoSession() {
  return useSyncExternalStore(subscribe, () => snapshot, () => initial);
}
