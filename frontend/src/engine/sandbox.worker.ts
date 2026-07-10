// executes a self-contained code bundle against inputs, in a throwaway worker.
// network + storage + timers are stubbed so nothing can reach the outside world.
// the main thread enforces the deadline by terminating this worker.

type Outcome = { ok: true; value: string } | { ok: false; error: string };

function stub(): void {
  const kill = () => { throw new Error("SandboxViolation: blocked in sandbox"); };
  const g = self as unknown as Record<string, unknown>;
  for (const k of ["fetch", "XMLHttpRequest", "WebSocket", "importScripts", "indexedDB"]) {
    try { g[k] = kill; } catch { /* frozen */ }
  }
}

function serialize(v: unknown, depth = 0): string {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  const t = typeof v;
  if (t === "number") return Number.isNaN(v as number) ? "NaN" : String(v);
  if (t === "string") return JSON.stringify(v);
  if (t === "boolean" || t === "bigint") return String(v);
  if (t === "function") return "[function]";
  if (t === "symbol") return "[symbol]";
  if (depth > 4) return "…";
  if (Array.isArray(v)) return "[" + v.slice(0, 20).map((x) => serialize(x, depth + 1)).join(",") + (v.length > 20 ? ",…" : "") + "]";
  try {
    const keys = Object.keys(v as object).slice(0, 20);
    return "{" + keys.map((k) => `${k}:${serialize((v as Record<string, unknown>)[k], depth + 1)}`).join(",") + "}";
  } catch {
    return String(v);
  }
}

self.onmessage = (e: MessageEvent<{ bundle: string; fnName: string; inputs: unknown[][] }>) => {
  stub();
  const { bundle, fnName, inputs } = e.data;
  let fn: (...args: unknown[]) => unknown;
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(`"use strict";\n${bundle}\nreturn ${fnName};`);
    fn = factory();
    if (typeof fn !== "function") throw new Error("not a function");
  } catch (err) {
    postMessage({ type: "compile-error", message: (err as Error).message });
    return;
  }

  const outcomes: Outcome[] = [];
  for (const args of inputs) {
    try {
      const result = fn(...args);
      outcomes.push({ ok: true, value: serialize(result) });
    } catch (err) {
      const e2 = err as Error;
      outcomes.push({ ok: false, error: `${e2.name}: ${e2.message}`.slice(0, 120) });
    }
  }
  postMessage({ type: "outcomes", outcomes });
};
