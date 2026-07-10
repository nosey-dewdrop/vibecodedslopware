// generate candidate inputs for a function from its parameter names.
// edge-case corpus first (0, -1, NaN, "", [], null…), then a few shape guesses.

type Val = unknown;

const NUM = [0, 1, -1, 2, 10, 0.5, -0.5, 100, NaN];
const STR = ["", "hello world", "a-b_c", "  spaced  ", "123", "ABC", "x"];
const ARR = [[], [1, 2, 3], [3, 1, 2], [1], ["a", "b"], [0, 0, 0]];
const BOOL = [true, false];
const ANY: Val[] = [0, 1, -1, "", "abc", null, undefined, [], [1, 2], true, false, NaN];

function candidatesFor(param: string): Val[] {
  const p = param.toLowerCase().replace(/[^a-z]/g, "");
  if (/^(s|str|text|name|msg|message|title|label|word|slug|url|path|key|char|line)$/.test(p) || /str|text|name|title|word|slug|path/.test(p))
    return STR;
  if (/^(n|i|j|k|x|y|z|num|count|len|length|size|idx|index|age|id|amt|amount|total|sum|min|max|price|qty)$/.test(p) || /num|count|index|amount|price/.test(p))
    return NUM;
  if (/^(arr|list|items|nums|values|xs|data|rows|elements|nodes)$/.test(p) || /list|items|array|values/.test(p))
    return ARR;
  if (/^(flag|is[a-z]*|has[a-z]*|enabled|active|on|open|done|valid)$/.test(p) || /^is|^has|enabled|flag/.test(p))
    return BOOL;
  return ANY;
}

// pull literals out of the function so boundary constants (e.g. `age >= 18`)
// become test inputs — otherwise fixed corpora miss them (the recall gap)
function harvest(source: string): { nums: number[]; strs: string[] } {
  const nums = new Set<number>();
  const strs = new Set<string>();
  for (const m of source.matchAll(/(?<![\w.])-?\d+(?:\.\d+)?/g)) {
    const n = Number(m[0]);
    if (Number.isFinite(n) && Math.abs(n) < 1e9) { nums.add(n); nums.add(n - 1); nums.add(n + 1); }
  }
  for (const m of source.matchAll(/"([^"\\]{0,40})"|'([^'\\]{0,40})'/g)) {
    strs.add(m[1] ?? m[2] ?? "");
  }
  return { nums: [...nums].slice(0, 20), strs: [...strs].slice(0, 10) };
}

// build up to `cap` input tuples across the params
export function generateInputs(params: string[], source = "", cap = 40): Val[][] {
  if (params.length === 0) return [[]];
  const lit = harvest(source);
  const perParam = params.map((p) => {
    const base = candidatesFor(p);
    // inject harvested literals so real boundaries get exercised
    if (base === NUM || base === ANY) return [...base, ...lit.nums];
    if (base === STR) return [...base, ...lit.strs];
    return base;
  });

  const tuples: Val[][] = [];
  // 1) aligned sweep: index i across every param (covers edge cases together)
  const maxLen = Math.max(...perParam.map((a) => a.length));
  for (let i = 0; i < maxLen && tuples.length < cap; i++) {
    tuples.push(perParam.map((cands) => cands[i % cands.length]));
  }
  // 2) a few cross combos: vary one param over its corpus, hold others at [0]
  for (let pi = 0; pi < params.length && tuples.length < cap; pi++) {
    for (const v of perParam[pi]) {
      if (tuples.length >= cap) break;
      const tuple = perParam.map((c) => c[0]);
      tuple[pi] = v;
      tuples.push(tuple);
    }
  }
  // dedupe by JSON
  const seen = new Set<string>();
  const out: Val[][] = [];
  for (const t of tuples) {
    const k = safeKey(t);
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  }
  return out.slice(0, cap);
}

function safeKey(t: Val[]): string {
  try { return JSON.stringify(t, (_k, v) => (typeof v === "number" && Number.isNaN(v) ? "NaN" : v)); }
  catch { return String(t); }
}

export function describeInput(t: Val[]): string {
  return "(" + t.map(fmt).join(", ") + ")";
}

export function fmt(v: Val): string {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "number" && Number.isNaN(v)) return "NaN";
  if (typeof v === "string") return JSON.stringify(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}
