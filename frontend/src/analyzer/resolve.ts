import type {
  CallEdge,
  ClassEdge,
  External,
  FileFacts,
  ModuleGroup,
  RepoMap,
  SymbolDef,
} from "./types";

const EXT_TRIES = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".d.ts"];
const INDEX_TRIES = ["/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
const HEURISTIC_FANOUT_CAP = 4; // don't explode on common names

// known external services worth surfacing on the map
const SERVICE_HINTS: { match: RegExp; name: string }[] = [
  { match: /supabase/i, name: "Supabase" },
  { match: /stripe/i, name: "Stripe" },
  { match: /firebase/i, name: "Firebase" },
  { match: /openai|anthropic/i, name: "AI API" },
  { match: /axios|node-fetch|got\b/i, name: "HTTP client" },
  { match: /(^|\/)pg$|mysql|mongodb|prisma|sequelize/i, name: "Database" },
];

function dirname(p: string): string {
  const i = p.lastIndexOf("/");
  return i === -1 ? "" : p.slice(0, i);
}

function normalize(p: string): string {
  const parts = p.split("/");
  const out: string[] = [];
  for (const seg of parts) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

function resolveSpecifier(fromFile: string, spec: string, fileset: Set<string>): string | null {
  if (!spec.startsWith(".")) return null; // bare -> external
  const base = normalize(dirname(fromFile) + "/" + spec);
  // ts esm convention: import "./x.js" may mean ./x.ts
  const stripped = base.replace(/\.(js|jsx|mjs|cjs)$/, "");
  for (const cand of new Set([base, stripped])) {
    for (const ext of EXT_TRIES) if (fileset.has(cand + ext)) return cand + ext;
    for (const idx of INDEX_TRIES) if (fileset.has(cand + idx)) return cand + idx;
  }
  return null;
}

function topModule(path: string): string {
  const dir = dirname(path);
  if (!dir) return "(root)";
  const parts = dir.split("/");
  // group by up to two leading segments for readable modules
  return parts.slice(0, 2).join("/");
}

export function resolveRepo(facts: FileFacts[]): RepoMap {
  const fileset = new Set(facts.map((f) => f.path));

  // 1. bind imports to files
  for (const f of facts) {
    for (const imp of f.imports) {
      const resolved = resolveSpecifier(f.path, imp.source, fileset);
      imp.resolvedFile = resolved;
      imp.external = resolved === null && !imp.source.startsWith(".");
    }
  }

  // 2. global symbol indexes
  const allSymbols: SymbolDef[] = [];
  const byName = new Map<string, SymbolDef[]>();
  const methodsByName = new Map<string, SymbolDef[]>();
  const exportedByFile = new Map<string, Map<string, SymbolDef>>();
  const symbolsByFile = new Map<string, SymbolDef[]>();
  const classByName = new Map<string, SymbolDef[]>();

  for (const f of facts) {
    const list: SymbolDef[] = [];
    symbolsByFile.set(f.path, list);
    const exp = new Map<string, SymbolDef>();
    exportedByFile.set(f.path, exp);
    for (const s of f.symbols) {
      allSymbols.push(s);
      list.push(s);
      (byName.get(s.name) ?? byName.set(s.name, []).get(s.name)!).push(s);
      if (s.kind === "method") (methodsByName.get(s.name) ?? methodsByName.set(s.name, []).get(s.name)!).push(s);
      if (s.kind === "class") (classByName.get(s.name) ?? classByName.set(s.name, []).get(s.name)!).push(s);
      if (s.exported && !exp.has(s.name)) exp.set(s.name, s);
    }
  }

  // enclosing symbol lookup within a file (smallest range containing the line)
  const enclosing = (file: string, line: number): string => {
    let best: SymbolDef | null = null;
    for (const s of symbolsByFile.get(file) ?? []) {
      if (line >= s.startLine && line <= s.endLine) {
        if (!best || s.endLine - s.startLine < best.endLine - best.startLine) best = s;
      }
    }
    return best ? best.id : `${file}::<module>`;
  };

  // 3. bind calls with confidence
  const callEdges: CallEdge[] = [];
  let direct = 0, heuristic = 0, unresolved = 0;

  for (const f of facts) {
    const localByName = new Map<string, SymbolDef[]>();
    for (const s of symbolsByFile.get(f.path) ?? []) {
      (localByName.get(s.name) ?? localByName.set(s.name, []).get(s.name)!).push(s);
    }
    const importByLocal = new Map(f.imports.map((i) => [i.local, i]));

    for (const call of f.rawCalls) {
      const fromId = enclosing(f.path, call.line);
      const name = call.calleeName;

      const pushEdge = (toId: string | null, conf: CallEdge["confidence"]) => {
        callEdges.push({ fromId, toId, calleeName: name, confidence: conf, line: call.line });
        if (conf === "direct") direct++;
        else if (conf === "heuristic") heuristic++;
        else unresolved++;
      };

      if (call.kind === "member") {
        const targets = methodsByName.get(name) ?? [];
        if (targets.length === 0) pushEdge(null, "unresolved");
        else for (const t of targets.slice(0, HEURISTIC_FANOUT_CAP)) pushEdge(t.id, "heuristic");
        continue;
      }

      // id / new: try local, then imported, then repo-wide name match
      const local = localByName.get(name);
      if (local && local.length === 1) {
        pushEdge(local[0].id, "direct");
        continue;
      }
      const imp = importByLocal.get(name);
      if (imp && imp.resolvedFile) {
        const wanted = imp.imported === "default" ? undefined : imp.imported;
        const exp = exportedByFile.get(imp.resolvedFile);
        const target = wanted ? exp?.get(wanted) : [...(exp?.values() ?? [])][0];
        if (target) {
          pushEdge(target.id, "direct");
          continue;
        }
      }
      const global = byName.get(name) ?? [];
      if (global.length === 0) pushEdge(null, "unresolved");
      else if (global.length === 1) pushEdge(global[0].id, "heuristic");
      else for (const t of global.slice(0, HEURISTIC_FANOUT_CAP)) pushEdge(t.id, "heuristic");
    }
  }

  // 4. class relations
  const classEdges: ClassEdge[] = [];
  for (const f of facts) {
    for (const h of f.heritage) {
      const candidates = classByName.get(h.superName) ?? byName.get(h.superName) ?? [];
      if (candidates.length === 1) {
        classEdges.push({ fromId: h.subclassId, toId: candidates[0].id, toName: h.superName, kind: h.kind, confidence: "direct" });
      } else if (candidates.length > 1) {
        classEdges.push({ fromId: h.subclassId, toId: candidates[0].id, toName: h.superName, kind: h.kind, confidence: "heuristic" });
      } else {
        classEdges.push({ fromId: h.subclassId, toId: null, toName: h.superName, kind: h.kind, confidence: "unresolved" });
      }
    }
  }

  // 5. modules by directory
  const modMap = new Map<string, ModuleGroup>();
  for (const f of facts) {
    const name = topModule(f.path);
    const g = modMap.get(name) ?? { name, files: [], symbolCount: 0 };
    g.files.push(f.path);
    g.symbolCount += f.symbols.length;
    modMap.set(name, g);
  }
  const modules = [...modMap.values()].sort((a, b) => b.symbolCount - a.symbolCount);

  // 6. externals (packages + known services)
  const pkgCount = new Map<string, number>();
  for (const f of facts) {
    const bare = new Set<string>();
    for (const imp of f.imports) {
      if (!imp.external) continue;
      const pkg = imp.source.startsWith("@")
        ? imp.source.split("/").slice(0, 2).join("/")
        : imp.source.split("/")[0];
      bare.add(pkg);
    }
    for (const p of bare) pkgCount.set(p, (pkgCount.get(p) ?? 0) + 1);
  }
  const externals: External[] = [];
  const serviceSeen = new Map<string, number>();
  for (const [pkg, count] of pkgCount) {
    const hint = SERVICE_HINTS.find((h) => h.match.test(pkg));
    if (hint) serviceSeen.set(hint.name, (serviceSeen.get(hint.name) ?? 0) + count);
    else externals.push({ name: pkg, kind: "package", importedBy: count });
  }
  for (const [name, count] of serviceSeen) externals.unshift({ name, kind: "service", importedBy: count });
  externals.sort((a, b) => (a.kind === b.kind ? b.importedBy - a.importedBy : a.kind === "service" ? -1 : 1));

  const langCounts: Record<string, number> = {};
  for (const f of facts) langCounts[f.lang] = (langCounts[f.lang] ?? 0) + 1;

  return {
    files: facts.map((f) => f.path).sort(),
    symbols: allSymbols,
    callEdges,
    classEdges,
    modules,
    externals: externals.slice(0, 24),
    langCounts,
    unsupported: [],
    stats: {
      functions: allSymbols.filter((s) => s.kind !== "class").length,
      classes: allSymbols.filter((s) => s.kind === "class").length,
      directCalls: direct,
      heuristicCalls: heuristic,
      unresolvedCalls: unresolved,
    },
  };
}
