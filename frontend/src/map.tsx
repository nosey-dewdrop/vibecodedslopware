import { useMemo, useState } from "preact/hooks";
import type { CallEdge, RepoMap, SymbolDef } from "./analyzer/types";
import { WhatIfPanel } from "./whatif-panel";

const KIND_GLYPH: Record<string, string> = { function: "ƒ", arrow: "λ", method: "▪", class: "◆" };
const CONF_GLYPH: Record<string, string> = { direct: "●", heuristic: "◐", unresolved: "○" };
const CONF_LABEL: Record<string, string> = {
  direct: "resolved — we're sure",
  heuristic: "best guess — name match",
  unresolved: "couldn't resolve (dynamic or external)",
};

function moduleOf(path: string): string {
  const dir = path.slice(0, path.lastIndexOf("/"));
  if (!dir) return "(root)";
  return dir.split("/").slice(0, 2).join("/");
}

export function RepoExplorer({
  map, owner, repo, onReanalyze, onForget,
}: {
  map: RepoMap;
  owner: string;
  repo: string;
  onReanalyze: () => void;
  onForget: () => void;
}) {
  const [selId, setSelId] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const idx = useMemo(() => {
    const byId = new Map<string, SymbolDef>();
    for (const s of map.symbols) byId.set(s.id, s);
    const callers = new Map<string, CallEdge[]>();
    const callees = new Map<string, CallEdge[]>();
    for (const e of map.callEdges) {
      if (e.toId) (callers.get(e.toId) ?? callers.set(e.toId, []).get(e.toId)!).push(e);
      (callees.get(e.fromId) ?? callees.set(e.fromId, []).get(e.fromId)!).push(e);
    }
    const byModule = new Map<string, SymbolDef[]>();
    for (const s of map.symbols) {
      const m = moduleOf(s.file);
      (byModule.get(m) ?? byModule.set(m, []).get(m)!).push(s);
    }
    // callers count for "most central" ranking
    const inbound = new Map<string, number>();
    for (const [id, es] of callers) inbound.set(id, es.length);
    return { byId, callers, callees, byModule, inbound };
  }, [map]);

  const sel = selId ? idx.byId.get(selId) ?? null : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return map.symbols
      .filter((s) => s.name.toLowerCase().includes(q) || s.file.toLowerCase().includes(q))
      .sort((a, b) => (idx.inbound.get(b.id) ?? 0) - (idx.inbound.get(a.id) ?? 0))
      .slice(0, 40);
  }, [query, map, idx]);

  const pct = (n: number) => {
    const total = map.stats.directCalls + map.stats.heuristicCalls + map.stats.unresolvedCalls;
    return total ? Math.round((n / total) * 100) : 0;
  };

  return (
    <main>
      <div class="map-head">
        <div>
          <h1>{owner}/{repo}</h1>
          <p class="hint">
            {map.stats.functions} functions · {map.stats.classes} classes ·{" "}
            {map.files.length} files · analyzed in your browser, never uploaded
          </p>
        </div>
        <div class="map-actions">
          <button class="mini-btn" onClick={onReanalyze} title="fetch and analyze again">re-analyze</button>
          <button class="mini-btn danger" onClick={onForget} title="delete every trace of this repo from this device">forget</button>
          <a class="top-link" href="#/">← another</a>
        </div>
      </div>

      <div class="conf-bar" title="how confidently we resolved each call">
        <span class="conf direct">{CONF_GLYPH.direct} {pct(map.stats.directCalls)}% resolved</span>
        <span class="conf heuristic">{CONF_GLYPH.heuristic} {pct(map.stats.heuristicCalls)}% guessed</span>
        <span class="conf unresolved">{CONF_GLYPH.unresolved} {pct(map.stats.unresolvedCalls)}% dynamic/external</span>
      </div>

      <input
        class="prompt-input search"
        placeholder="search functions, classes, files…"
        value={query}
        onInput={(e) => { setQuery((e.target as HTMLInputElement).value); setSelId(null); }}
      />

      <div class="explorer">
        <aside class="explorer-side">
          {results ? (
            <>
              <p class="label">{results.length} matches</p>
              {results.map((s) => (
                <SymbolRow s={s} inbound={idx.inbound.get(s.id) ?? 0} onClick={() => setSelId(s.id)} active={s.id === selId} />
              ))}
              {results.length === 0 && <p class="hint">nothing matches "{query}"</p>}
            </>
          ) : (
            <>
              {map.externals.length > 0 && (
                <div class="ext-block">
                  <p class="label">talks to</p>
                  {map.externals.map((e) => (
                    <p class="ext-row">
                      <span class={"ext-dot " + (e.kind === "service" ? "svc" : "")}>{e.kind === "service" ? "◆" : "·"}</span>
                      {e.name} <span class="hint">×{e.importedBy}</span>
                    </p>
                  ))}
                </div>
              )}
              <p class="label">modules</p>
              {map.modules.map((m) => (
                <div class="mod">
                  <button class={"mod-head" + (openModule === m.name ? " open" : "")} onClick={() => setOpenModule(openModule === m.name ? null : m.name)}>
                    <span>{openModule === m.name ? "▾" : "▸"} {m.name}</span>
                    <span class="hint">{m.symbolCount}</span>
                  </button>
                  {openModule === m.name && (
                    <div class="mod-syms">
                      {(idx.byModule.get(m.name) ?? [])
                        .slice()
                        .sort((a, b) => (idx.inbound.get(b.id) ?? 0) - (idx.inbound.get(a.id) ?? 0))
                        .map((s) => (
                          <SymbolRow s={s} inbound={idx.inbound.get(s.id) ?? 0} onClick={() => setSelId(s.id)} active={s.id === selId} />
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </aside>

        <section class="explorer-main">
          {sel ? (
            <SymbolDetail sel={sel} idx={idx} onPick={setSelId} map={map} />
          ) : (
            <div class="empty-detail">
              <p class="empty-glyph">◆ ƒ λ ▪</p>
              <p>pick a function or class to see what calls it, what it calls, and
              how sure we are about each link.</p>
              <p class="hint">open a module on the left, or search above.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SymbolRow({ s, inbound, onClick, active }: { s: SymbolDef; inbound: number; onClick: () => void; active: boolean }) {
  return (
    <button class={"sym-row" + (active ? " active" : "")} onClick={onClick}>
      <span class="sym-kind">{KIND_GLYPH[s.kind]}</span>
      <span class="sym-name">{s.className ? `${s.className}.${s.name}` : s.name}</span>
      {inbound > 0 && <span class="sym-in" title={`${inbound} callers`}>←{inbound}</span>}
    </button>
  );
}

type Idx = {
  byId: Map<string, SymbolDef>;
  callers: Map<string, CallEdge[]>;
  callees: Map<string, CallEdge[]>;
  inbound: Map<string, number>;
};

function SymbolDetail({ sel, idx, onPick, map }: { sel: SymbolDef; idx: Idx; onPick: (id: string) => void; map: RepoMap }) {
  const callers = idx.callers.get(sel.id) ?? [];
  const callees = (idx.callees.get(sel.id) ?? []).filter((e) => e.toId && e.toId !== sel.id);
  const uniqueCallers = dedupe(callers.map((e) => ({ id: e.fromId, conf: e.confidence })));
  const uniqueCallees = dedupe(callees.map((e) => ({ id: e.toId!, conf: e.confidence })));

  return (
    <div class="detail">
      <p class="label">{sel.kind}{sel.exported ? " · exported" : ""}</p>
      <h2 class="detail-name">{sel.className ? `${sel.className}.${sel.name}` : sel.name}</h2>
      <p class="detail-meta">{sel.file}:{sel.startLine} · {sel.lines} lines{sel.params.length ? ` · (${sel.params.join(", ")})` : ""}</p>
      <pre class="detail-sig"><code>{sel.signature}</code></pre>

      <Neighborhood sel={sel} callers={uniqueCallers} callees={uniqueCallees} idx={idx} onPick={onPick} />

      <div class="detail-cols">
        <div>
          <p class="label">called by ({uniqueCallers.length})</p>
          {uniqueCallers.length === 0 && <p class="hint">nothing calls this — an entry point, or dead code.</p>}
          {uniqueCallers.map((c) => <RelRow ref={c} idx={idx} onPick={onPick} />)}
        </div>
        <div>
          <p class="label">calls ({uniqueCallees.length})</p>
          {uniqueCallees.length === 0 && <p class="hint">calls nothing we resolved.</p>}
          {uniqueCallees.map((c) => <RelRow ref={c} idx={idx} onPick={onPick} />)}
        </div>
      </div>

      <WhatIfPanel target={sel} map={map} />
    </div>
  );
}

function RelRow({ ref, idx, onPick }: { ref: { id: string; conf: string }; idx: Idx; onPick: (id: string) => void }) {
  const s = idx.byId.get(ref.id);
  const label = s ? (s.className ? `${s.className}.${s.name}` : s.name) : ref.id.split("::").pop();
  return (
    <button class="rel-row" onClick={() => s && onPick(s.id)} disabled={!s} title={CONF_LABEL[ref.conf]}>
      <span class={"conf-dot " + ref.conf}>{CONF_GLYPH[ref.conf]}</span>
      <span class="rel-name">{label}</span>
      {s && <span class="hint rel-file">{moduleOf(s.file)}</span>}
    </button>
  );
}

function Neighborhood({
  sel, callers, callees, idx, onPick,
}: {
  sel: SymbolDef;
  callers: { id: string; conf: string }[];
  callees: { id: string; conf: string }[];
  idx: Idx;
  onPick: (id: string) => void;
}) {
  const CAP = 6;
  const L = callers.slice(0, CAP);
  const R = callees.slice(0, CAP);
  if (L.length === 0 && R.length === 0) return null;
  const W = 640, H = Math.max(120, Math.max(L.length, R.length) * 34 + 30);
  const cx = W / 2, cy = H / 2;
  const colY = (n: number, i: number) => (n === 1 ? cy : 24 + (i * (H - 48)) / Math.max(1, n - 1));
  const nameOf = (id: string) => {
    const s = idx.byId.get(id);
    return s ? (s.className ? `${s.className}.${s.name}` : s.name) : id.split("::").pop() ?? "?";
  };

  return (
    <svg class="neigh" viewBox={`0 0 ${W} ${H}`} width="100%">
      {L.map((c, i) => {
        const y = colY(L.length, i);
        return <line class={"edge " + c.conf} x1={148} y1={y} x2={cx - 60} y2={cy} />;
      })}
      {R.map((c, i) => {
        const y = colY(R.length, i);
        return <line class={"edge " + c.conf} x1={cx + 60} y1={cy} x2={W - 148} y2={y} />;
      })}
      {L.map((c, i) => {
        const y = colY(L.length, i);
        return (
          <g class="node" onClick={() => idx.byId.get(c.id) && onPick(c.id)} style={idx.byId.get(c.id) ? "cursor:pointer" : ""}>
            <rect x={8} y={y - 12} width={140} height={24} rx={2} />
            <text x={78} y={y + 4} text-anchor="middle">{trunc(nameOf(c.id))}</text>
          </g>
        );
      })}
      <g class="node center">
        <rect x={cx - 60} y={cy - 14} width={120} height={28} rx={2} />
        <text x={cx} y={cy + 4} text-anchor="middle">{trunc(sel.name)}</text>
      </g>
      {R.map((c, i) => {
        const y = colY(R.length, i);
        return (
          <g class="node" onClick={() => idx.byId.get(c.id) && onPick(c.id)} style={idx.byId.get(c.id) ? "cursor:pointer" : ""}>
            <rect x={W - 148} y={y - 12} width={140} height={24} rx={2} />
            <text x={W - 78} y={y + 4} text-anchor="middle">{trunc(nameOf(c.id))}</text>
          </g>
        );
      })}
    </svg>
  );
}

function trunc(s: string): string {
  return s.length > 16 ? s.slice(0, 15) + "…" : s;
}

function dedupe(rows: { id: string; conf: string }[]): { id: string; conf: string }[] {
  const order = { direct: 0, heuristic: 1, unresolved: 2 } as Record<string, number>;
  const best = new Map<string, string>();
  for (const r of rows) {
    const cur = best.get(r.id);
    if (cur === undefined || order[r.conf] < order[cur]) best.set(r.id, r.conf);
  }
  return [...best.entries()].map(([id, conf]) => ({ id, conf }));
}
