import { useMemo, useState } from "preact/hooks";
import type { RepoMap, SymbolDef } from "./analyzer/types";
import { computeBlast, runWhatIf, type WhatIfReport } from "./engine/whatif";
import { burst } from "./confetti";

export function WhatIfPanel({ target, map }: { target: SymbolDef; map: RepoMap }) {
  const [report, setReport] = useState<WhatIfReport | null>(null);
  const [running, setRunning] = useState(false);

  // blast radius is static + cheap — show it immediately
  const blast = useMemo(() => computeBlast(target, map), [target, map]);

  const canRun = (target.kind === "function" || target.kind === "arrow") && !!target.source;

  const run = async (e: MouseEvent) => {
    setRunning(true);
    setReport(null);
    const r = await runWhatIf(target, map);
    setReport(r);
    setRunning(false);
    if (r.runnable && r.mutants?.some((m) => m.verdict === "killed")) {
      burst((e.target as HTMLElement).getBoundingClientRect().left + 40, (e.target as HTMLElement).getBoundingClientRect().top, 22);
    }
  };

  const killed = report?.mutants?.filter((m) => m.verdict === "killed") ?? [];
  const survived = report?.mutants?.filter((m) => m.verdict === "survived") ?? [];

  return (
    <div class="whatif">
      <p class="label">what if you change this?</p>

      {blast.nodes.length > 0 ? (
        <p class="blast-line">
          touch this and it ripples to <strong>{blast.nodes.length}{blast.truncated ? "+" : ""}</strong>{" "}
          function{blast.nodes.length === 1 ? "" : "s"} that depend on it:
        </p>
      ) : (
        <p class="blast-line hint">nothing else calls this — changing it is contained here.</p>
      )}
      {blast.nodes.length > 0 && (
        <div class="blast-list">
          {blast.nodes.slice(0, 12).map((n) => (
            <span class="blast-chip" title={n.file}>{n.name}<span class="blast-depth">·{n.depth}</span></span>
          ))}
          {blast.nodes.length > 12 && <span class="hint">+{blast.nodes.length - 12} more</span>}
        </div>
      )}

      {canRun ? (
        <button class="btn run-btn" disabled={running} onClick={run}>
          {running ? "spinning up sandboxes…" : report ? "▶ run again" : "▶ break it on purpose"}
        </button>
      ) : (
        <p class="hint" style="margin-top:10px">
          {target.kind === "method" || target.kind === "class"
            ? "the live experiment runs on standalone functions for now — methods need their class."
            : "no runnable source captured for this one."}
        </p>
      )}

      {report && !report.runnable && (
        <p class="whatif-reason">can't run the live experiment: {report.reason}. the ripple map above still holds.</p>
      )}

      {report && report.runnable && (
        <div class="whatif-result">
          <p class="hint">
            ran the real function {report.inputCount} ways{report.deps?.length ? ` (with helpers: ${report.deps.join(", ")})` : ""}.
            planted {report.mutants!.length} one-line changes:
          </p>
          {killed.length > 0 && (
            <div class="mut-block">
              <p class="mut-head killed">{killed.length} change{killed.length === 1 ? "" : "s"} that break it</p>
              {killed.map((m) => (
                <div class="mut-row">
                  <p class="mut-change">line {m.line}: <code>{m.from}</code> → <code>{m.to}</code></p>
                  {m.by && (
                    <p class="mut-detail">
                      on <code>{target.name}{m.by.input}</code> it was <span class="was">{m.by.was}</span>,
                      now <span class="now">{m.by.now}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {survived.length > 0 && (
            <div class="mut-block">
              <p class="mut-head survived">{survived.length} change{survived.length === 1 ? "" : "s"} nothing noticed</p>
              {survived.map((m) => (
                <p class="mut-row survived-row">
                  line {m.line}: <code>{m.from}</code> → <code>{m.to}</code>
                  <span class="hint"> — your tests wouldn't catch this</span>
                </p>
              ))}
            </div>
          )}
          {killed.length === 0 && survived.length === 0 && (
            <p class="hint">no single-operator changes applied to this one.</p>
          )}
        </div>
      )}
    </div>
  );
}
