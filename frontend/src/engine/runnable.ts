import type { RepoMap, SymbolDef } from "../analyzer/types";

export type Runnable =
  | { ok: true; depsSource: string; targetSource: string; deps: string[] }
  | { ok: false; reason: string };

// decide whether a function can be executed in isolation, and if so build a
// self-contained bundle: the target plus every same-file helper it needs.
export function buildRunnable(target: SymbolDef, map: RepoMap): Runnable {
  if (target.kind !== "function" && target.kind !== "arrow") {
    return { ok: false, reason: "only standalone functions can run for now — methods need their class" };
  }
  if (!target.source) return { ok: false, reason: "no source captured for this function" };
  if (target.dangerRef === "__lang__") return { ok: false, reason: "the runner speaks JavaScript/TypeScript for now" };
  if (target.dangerRef) return { ok: false, reason: `touches \`${target.dangerRef}\` (needs the outside world)` };

  // index same-file runnable functions by name
  const sameFile = map.symbols.filter(
    (s) => s.file === target.file && (s.kind === "function" || s.kind === "arrow") && s.source,
  );
  const byName = new Map<string, SymbolDef>();
  for (const s of sameFile) if (!byName.has(s.name)) byName.set(s.name, s);

  const included = new Map<string, SymbolDef>();
  const order: SymbolDef[] = [];
  const visit = (sym: SymbolDef): string | null => {
    if (included.has(sym.id)) return null;
    if (sym.dangerRef && sym.dangerRef !== null) return `\`${sym.name}\` touches \`${sym.dangerRef}\``;
    included.set(sym.id, sym);
    for (const ref of sym.freeRefs ?? []) {
      const dep = byName.get(ref);
      if (!dep) {
        // an unresolved free reference — an import or something we can't run
        return `\`${sym.name}\` needs \`${ref}\`, which isn't a plain local function`;
      }
      const err = visit(dep);
      if (err) return err;
    }
    order.push(sym);
    return null;
  };

  const err = visit(target);
  if (err) return { ok: false, reason: err };

  // deps = everything except the target, in dependency order
  const deps = order.filter((s) => s.id !== target.id);
  const depsSource = deps.map((s) => stripExport(s.source!)).join("\n\n");
  const targetSource = stripExport(target.source!);
  return { ok: true, depsSource, targetSource, deps: deps.map((d) => d.name) };
}

// remove a leading `export ` so the bundle is plain declarations
function stripExport(src: string): string {
  return src.replace(/^\s*export\s+(default\s+)?/, "");
}
