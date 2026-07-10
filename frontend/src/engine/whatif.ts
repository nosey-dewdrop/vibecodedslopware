import type { RepoMap, SymbolDef } from "../analyzer/types";
import { buildRunnable } from "./runnable";
import { makeMutants } from "./mutators";
import { generateInputs, describeInput } from "./inputs";
import { runProgram, type Outcome } from "./sandbox";

export interface MutantVerdict {
  from: string;
  to: string;
  kind: string;
  line: number;
  snippet: string;
  verdict: "killed" | "survived" | "error";
  by?: { input: string; was: string; now: string };
}

export interface BlastNode { id: string; name: string; file: string; depth: number }

export interface WhatIfReport {
  runnable: boolean;
  reason?: string;
  deps?: string[];
  inputCount?: number;
  sampleInputs?: string[];
  mutants?: MutantVerdict[];
  blast: BlastNode[];
  blastTruncated: boolean;
}

// static blast radius: everything that transitively CALLS this symbol
export function computeBlast(target: SymbolDef, map: RepoMap, cap = 40): { nodes: BlastNode[]; truncated: boolean } {
  const callersOf = new Map<string, Set<string>>();
  for (const e of map.callEdges) {
    if (!e.toId) continue;
    (callersOf.get(e.toId) ?? callersOf.set(e.toId, new Set()).get(e.toId)!).add(e.fromId);
  }
  const byId = new Map(map.symbols.map((s) => [s.id, s]));
  const seen = new Set<string>([target.id]);
  const nodes: BlastNode[] = [];
  let frontier = [target.id];
  let depth = 1;
  let truncated = false;
  while (frontier.length && depth <= 6) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const caller of callersOf.get(id) ?? []) {
        if (seen.has(caller)) continue;
        seen.add(caller);
        const s = byId.get(caller);
        if (s) {
          if (nodes.length >= cap) { truncated = true; continue; }
          nodes.push({ id: caller, name: s.className ? `${s.className}.${s.name}` : s.name, file: s.file, depth });
        }
        next.push(caller);
      }
    }
    frontier = next;
    depth++;
  }
  return { nodes, truncated };
}

function same(a: Outcome, b: Outcome): boolean {
  if (a.ok && b.ok) return a.value === b.value;
  if (!a.ok && !b.ok) return a.error === b.error;
  return false;
}

function show(o: Outcome): string {
  return o.ok ? o.value : `throws ${o.error}`;
}

export async function runWhatIf(target: SymbolDef, map: RepoMap): Promise<WhatIfReport> {
  const blastRes = computeBlast(target, map);
  const blast = blastRes.nodes;
  const blastTruncated = blastRes.truncated;

  const r = buildRunnable(target, map);
  if (!r.ok) return { runnable: false, reason: r.reason, blast, blastTruncated };

  const inputs = generateInputs(target.params, r.targetSource);
  const fullBundle = r.depsSource ? `${r.depsSource}\n\n${r.targetSource}` : r.targetSource;

  const baseline = await runProgram(fullBundle, target.name, inputs);
  if (baseline.status === "timeout")
    return { runnable: false, reason: "this function loops forever on some of these inputs — can't run the experiment", blast, blastTruncated };
  if (baseline.status === "compile-error")
    return { runnable: false, reason: "we couldn't run this one (syntax we don't handle yet)", blast, blastTruncated };

  const base = baseline.outcomes;
  const mutants = makeMutants(r.targetSource, 10);
  const verdicts: MutantVerdict[] = [];

  for (const m of mutants) {
    const mutantBundle = r.depsSource ? `${r.depsSource}\n\n${m.source}` : m.source;
    const res = await runProgram(mutantBundle, target.name, inputs);
    const vd: MutantVerdict = { from: m.from, to: m.to, kind: m.kind, line: m.line, snippet: m.snippet, verdict: "survived" };

    if (res.status === "timeout") {
      vd.verdict = "killed";
      vd.by = { input: "some input", was: "returns a value", now: "spins forever (infinite loop)" };
    } else if (res.status === "compile-error") {
      vd.verdict = "error";
    } else {
      for (let i = 0; i < base.length; i++) {
        if (!same(base[i], res.outcomes[i])) {
          vd.verdict = "killed";
          vd.by = { input: describeInput(inputs[i]), was: show(base[i]), now: show(res.outcomes[i]) };
          break;
        }
      }
    }
    verdicts.push(vd);
  }

  return {
    runnable: true,
    deps: r.deps,
    inputCount: inputs.length,
    sampleInputs: inputs.slice(0, 6).map(describeInput),
    mutants: verdicts,
    blast,
    blastTruncated,
  };
}
