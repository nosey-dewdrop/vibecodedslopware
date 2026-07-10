export type Outcome = { ok: true; value: string } | { ok: false; error: string };
export type RunResult =
  | { status: "ok"; outcomes: Outcome[] }
  | { status: "timeout" }
  | { status: "compile-error"; message: string };

// run a bundle against inputs in a fresh throwaway worker with a hard deadline.
// a hang (infinite loop) is killed by terminate(); nothing leaks between runs.
export function runProgram(
  bundle: string,
  fnName: string,
  inputs: unknown[][],
  timeoutMs = 2500,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url));
    let settled = false;
    const done = (r: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(r);
    };
    const timer = setTimeout(() => done({ status: "timeout" }), timeoutMs);
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "outcomes") done({ status: "ok", outcomes: msg.outcomes });
      else if (msg.type === "compile-error") done({ status: "compile-error", message: msg.message });
    };
    worker.onerror = () => done({ status: "compile-error", message: "sandbox crashed" });
    worker.postMessage({ bundle, fnName, inputs });
  });
}
