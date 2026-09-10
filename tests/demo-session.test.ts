import { test } from "node:test";
import assert from "node:assert/strict";
import { emptySession, readSession, reduceSession, sessionData } from "../src/lib/demo-session";
import { prioritizedExceptions } from "../src/lib/rules";
import { executiveMetrics } from "../src/lib/executive-metrics";

test("resolution survives serialization and updates queue, detail and executive counts", () => {
  const before = sessionData(emptySession);
  const id = before.exceptions[0].id;
  const state = readSession(JSON.stringify(reduceSession(emptySession, { type: "exception", id, status: "resolved", label: "Demo resolved" })));
  const after = sessionData(state);
  assert.equal(after.exceptions.find(e => e.id === id)?.status, "resolved");
  assert.equal(prioritizedExceptions(after.exceptions, after.shipments).length, prioritizedExceptions(before.exceptions, before.shipments).length - 1);
  assert.notDeepEqual(executiveMetrics(after.shipments, after.exceptions, after.communications), executiveMetrics(before.shipments, before.exceptions, before.communications));
});
test("POD receipt is idempotent and agrees between load and document queue", () => {
  const id = sessionData(emptySession).shipments[0].id;
  let state = reduceSession(emptySession, { type: "document", shipmentId: id });
  state = reduceSession(state, { type: "document", shipmentId: id });
  const data = sessionData(readSession(JSON.stringify(state)));
  assert.equal(state.received.length, 1);
  assert.equal(data.shipments[0].podStatus, "received");
  assert.equal(data.documents.find(d => d.shipmentId === id && d.type === "POD")?.status, "received");
});
test("communication actions are explicitly simulated and leave source ETA unchanged", () => {
  const initial = sessionData(emptySession);
  const data = sessionData(reduceSession(emptySession, { type: "communication", shipmentId: initial.shipments[0].id, text: "Test draft" }));
  assert.match(data.communications[0].summary, /SIMULATION — not sent/);
  assert.equal(data.shipments[0].eta, initial.shipments[0].eta);
});
test("injected exception is shared, resolvable and resettable", () => {
  let state = reduceSession(emptySession, { type: "inject", title: "missing POD" });
  assert.equal(sessionData(state).exceptions.length, sessionData(emptySession).exceptions.length + 1);
  state = reduceSession(state, { type: "exception", id: "demo-injected-exception", status: "resolved", label: "Resolved" });
  assert.equal(sessionData(state).exceptions.at(-1)?.status, "resolved");
  assert.deepEqual(reduceSession(state, { type: "reset" }), emptySession);
});
test("invalid and stale saved sessions fall back safely", () => {
  for (const raw of [null, "broken", JSON.stringify({ ...emptySession, version: 0 }), JSON.stringify({ ...emptySession, updates: [{ shipmentId: "missing", text: "x" }] })]) assert.deepEqual(readSession(raw), emptySession);
  assert.equal(reduceSession(emptySession, { type: "document", shipmentId: "missing" }), emptySession);
});
