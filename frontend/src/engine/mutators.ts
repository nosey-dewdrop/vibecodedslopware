// mutation testing — the 5 high-signal mutators (PIT/Stryker research).
// we tokenize first so we never mutate an operator that lives inside a string,
// comment, template, or regex literal.

export interface Mutant {
  id: number;
  from: string;
  to: string;
  kind: string;
  line: number; // 1-based, within the function source
  source: string; // full mutated source
  snippet: string; // the mutated line, trimmed
}

type Tok = { text: string; index: number };

// scan operators/keywords in value context, skipping strings/comments/regex
function scanOperators(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  let prevSig = ""; // previous significant char, for regex detection

  const isIdentChar = (c: string) => /[A-Za-z0-9_$]/.test(c);

  while (i < n) {
    const c = src[i];
    const two = src.slice(i, i + 2);

    // comments
    if (two === "//") { i = src.indexOf("\n", i); if (i === -1) i = n; continue; }
    if (two === "/*") { const e = src.indexOf("*/", i + 2); i = e === -1 ? n : e + 2; continue; }

    // strings
    if (c === '"' || c === "'" || c === "`") {
      const quote = c; i++;
      while (i < n) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === quote) { i++; break; }
        if (quote === "`" && src.slice(i, i + 2) === "${") {
          // skip a template expression, tracking nested braces
          i += 2; let depth = 1;
          while (i < n && depth > 0) { if (src[i] === "{") depth++; else if (src[i] === "}") depth--; i++; }
          continue;
        }
        i++;
      }
      prevSig = quote; continue;
    }

    // regex literal: `/` after an operator/keyword/opening char is a regex
    if (c === "/") {
      const regexAllowed = prevSig === "" || "(,=:[!&|?{;".includes(prevSig) ||
        /return|typeof|case|in|of|do|else/.test(tail(toks));
      if (regexAllowed) {
        i++; let inClass = false;
        while (i < n) {
          if (src[i] === "\\") { i += 2; continue; }
          if (src[i] === "[") inClass = true;
          else if (src[i] === "]") inClass = false;
          else if (src[i] === "/" && !inClass) { i++; break; }
          i++;
        }
        while (i < n && /[a-z]/.test(src[i])) i++; // flags
        prevSig = "/"; continue;
      }
    }

    // identifiers / keywords
    if (isIdentChar(c) && !/[0-9]/.test(c)) {
      let j = i; while (j < n && isIdentChar(src[j])) j++;
      const word = src.slice(i, j);
      if (word === "true" || word === "false") toks.push({ text: word, index: i });
      prevSig = "x"; i = j; continue;
    }
    // numbers
    if (/[0-9]/.test(c)) { let j = i; while (j < n && /[0-9._eExXa-fA-F]/.test(src[j])) j++; prevSig = "0"; i = j; continue; }

    // multi-char operators first
    const three = src.slice(i, i + 3);
    if (three === "===" || three === "!==") { toks.push({ text: three, index: i }); prevSig = three[0]; i += 3; continue; }
    if (two === "&&" || two === "||" || two === "==" || two === "!=" || two === "<=" || two === ">=") {
      toks.push({ text: two, index: i }); prevSig = two[0]; i += 2; continue;
    }
    if ("+-*/%<>".includes(c)) { toks.push({ text: c, index: i }); prevSig = c; i++; continue; }

    if (!/\s/.test(c)) prevSig = c;
    i++;
  }
  return toks;
}

function tail(toks: Tok[]): string {
  return toks.length ? toks[toks.length - 1].text : "";
}

const SWAP: Record<string, { to: string; kind: string }> = {
  "<": { to: "<=", kind: "boundary" },
  "<=": { to: "<", kind: "boundary" },
  ">": { to: ">=", kind: "boundary" },
  ">=": { to: ">", kind: "boundary" },
  "===": { to: "!==", kind: "negate" },
  "!==": { to: "===", kind: "negate" },
  "==": { to: "!=", kind: "negate" },
  "!=": { to: "==", kind: "negate" },
  "+": { to: "-", kind: "arithmetic" },
  "-": { to: "+", kind: "arithmetic" },
  "*": { to: "/", kind: "arithmetic" },
  "/": { to: "*", kind: "arithmetic" },
  "%": { to: "*", kind: "arithmetic" },
  "&&": { to: "||", kind: "logical" },
  "||": { to: "&&", kind: "logical" },
  true: { to: "false", kind: "boolean" },
  false: { to: "true", kind: "boolean" },
};

function lineOf(src: string, index: number): number {
  let line = 1;
  for (let k = 0; k < index; k++) if (src[k] === "\n") line++;
  return line;
}

export function makeMutants(src: string, cap = 12): Mutant[] {
  const toks = scanOperators(src);
  const out: Mutant[] = [];
  let id = 0;
  for (const t of toks) {
    const swap = SWAP[t.text];
    if (!swap) continue;
    const mutated = src.slice(0, t.index) + swap.to + src.slice(t.index + t.text.length);
    const line = lineOf(src, t.index);
    const snippet = mutated.split("\n")[line - 1].trim().slice(0, 100);
    out.push({ id: id++, from: t.text, to: swap.to, kind: swap.kind, line, source: mutated, snippet });
    if (out.length >= cap) break;
  }
  return out;
}
