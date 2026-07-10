import type Parser from "web-tree-sitter";
import type { FileFacts, Lang, RawCall, RawHeritage, SymbolDef, SymbolKind } from "./types";

// pull one capture node by name out of a query match
function cap(m: Parser.QueryMatch, name: string): Parser.SyntaxNode | null {
  for (const c of m.captures) if (c.name === name) return c.node;
  return null;
}

function paramNames(paramsNode: Parser.SyntaxNode | null): string[] {
  if (!paramsNode) return [];
  const out: string[] = [];
  // single-identifier arrow param: `x => ...`
  if (paramsNode.type === "identifier") return [paramsNode.text];
  for (const child of paramsNode.namedChildren) {
    if (child.type === "comment") continue;
    const t = child.text.split(/[:=]/)[0].trim().replace(/^\.\.\./, "");
    if (t) out.push(t);
  }
  return out;
}

function enclosingClassName(node: Parser.SyntaxNode): string | undefined {
  let p = node.parent;
  while (p) {
    if (p.type === "class_declaration" || p.type === "class" || p.type === "class_definition") {
      const n = p.childForFieldName("name");
      return n?.text;
    }
    p = p.parent;
  }
  return undefined;
}

function isExportedByAncestor(node: Parser.SyntaxNode): boolean {
  let p = node.parent;
  let hops = 0;
  while (p && hops < 4) {
    if (p.type === "export_statement") return true;
    p = p.parent;
    hops++;
  }
  return false;
}

function firstLine(node: Parser.SyntaxNode): string {
  return node.text.split("\n")[0].trim().slice(0, 120);
}

// turn a TS function into runnable JS by deleting type syntax. best-effort:
// if we miss something the sandbox just reports "couldn't run this one".
function stripTypes(defNode: Parser.SyntaxNode, lang: Lang): string {
  if (lang !== "typescript" && lang !== "tsx") return defNode.text;
  const base = defNode.startIndex;
  const text = defNode.text;
  const edits: { start: number; end: number }[] = [];
  const push = (a: number, b: number) => { if (b > a) edits.push({ start: a - base, end: b - base }); };

  const walk = (n: Parser.SyntaxNode) => {
    switch (n.type) {
      case "type_annotation":
      case "type_parameters":
      case "type_arguments":
        push(n.startIndex, n.endIndex);
        return; // don't descend
      case "as_expression":
      case "satisfies_expression": {
        const val = n.namedChildren[0];
        if (val) push(val.endIndex, n.endIndex); // drop ` as T`
        if (val) walk(val);
        return;
      }
      case "non_null_expression": {
        const val = n.namedChildren[0];
        if (val) { push(val.endIndex, n.endIndex); walk(val); }
        return;
      }
      case "optional_parameter": {
        const pat = n.childForFieldName("pattern") ?? n.namedChildren[0];
        if (pat && defNode.text[pat.endIndex - base] === "?") push(pat.endIndex, pat.endIndex + 1);
        for (const c of n.namedChildren) walk(c);
        return;
      }
    }
    for (const c of n.namedChildren) walk(c);
  };
  walk(defNode);

  if (!edits.length) return text;
  edits.sort((a, b) => a.start - b.start);
  let out = "";
  let cur = 0;
  for (const e of edits) {
    if (e.start < cur) continue; // overlapping, skip
    out += text.slice(cur, e.start);
    cur = e.end;
  }
  out += text.slice(cur);
  return out;
}

// safe globals a pure function may use without breaking sandboxed execution
const BUILTINS = new Set([
  "Math", "JSON", "Object", "Array", "String", "Number", "Boolean", "Symbol",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "RegExp", "Date", "BigInt",
  "Error", "TypeError", "RangeError", "SyntaxError", "parseInt", "parseFloat",
  "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent", "encodeURI",
  "decodeURI", "undefined", "NaN", "Infinity", "console", "structuredClone",
  "Intl", "ArrayBuffer", "Uint8Array", "Int32Array", "Float64Array",
]);
// globals that mean "this touches the outside world" -> not runnable in isolation
const DANGER = new Set([
  "window", "document", "globalThis", "self", "fetch", "XMLHttpRequest",
  "WebSocket", "localStorage", "sessionStorage", "indexedDB", "process",
  "require", "module", "exports", "eval", "Function", "importScripts",
  "navigator", "location", "alert", "prompt", "__dirname", "__filename",
  "setTimeout", "setInterval", "requestAnimationFrame",
]);

// collect names bound inside a function (params, locals, nested decls) and the
// free identifiers it references in value position
function analyzeRunnability(
  defNode: Parser.SyntaxNode,
  lang: Lang,
  params: string[],
): { freeRefs: string[]; dangerRef: string | null } {
  if (lang !== "javascript" && lang !== "typescript" && lang !== "tsx") {
    return { freeRefs: [], dangerRef: "__lang__" }; // runner speaks JS/TS/TSX only for now
  }
  const bound = new Set<string>(params);
  const used = new Set<string>();

  const identsIn = (n: Parser.SyntaxNode): string[] => {
    const out: string[] = [];
    const rec = (x: Parser.SyntaxNode) => {
      if (x.type === "identifier") out.push(x.text);
      for (const c of x.namedChildren) rec(c);
    };
    rec(n);
    return out;
  };

  const collectBound = (n: Parser.SyntaxNode) => {
    // names introduced by declarations anywhere in the body (incl. destructuring)
    if (n.type === "variable_declarator") {
      const nm = n.childForFieldName("name");
      if (nm) for (const id of identsIn(nm)) bound.add(id);
    } else if (n.type === "function_declaration" || n.type === "generator_function_declaration" || n.type === "class_declaration") {
      const nm = n.childForFieldName("name");
      if (nm && nm.type === "identifier") bound.add(nm.text);
    } else if (n.type === "for_in_statement") {
      const left = n.childForFieldName("left");
      if (left) for (const id of identsIn(left)) bound.add(id);
    } else if (n.type === "catch_clause") {
      const p = n.childForFieldName("parameter") ?? n.namedChildren.find((c) => c.type !== "statement_block");
      if (p) for (const id of identsIn(p)) bound.add(id);
    } else if (n.type === "required_parameter" || n.type === "optional_parameter" || n.type === "formal_parameters") {
      for (const id of identsIn(n)) bound.add(id);
    }
    for (const c of n.namedChildren) collectBound(c);
  };

  // bound: nested params of arrows/functions inside the body too
  const collectNestedParams = (n: Parser.SyntaxNode) => {
    if ((n.type === "arrow_function" || n.type === "function_expression" ||
         n.type === "function_declaration" || n.type === "method_definition") && n !== defNode) {
      const p = n.childForFieldName("parameters") ?? n.childForFieldName("parameter");
      if (p) for (const id of identsIn(p)) bound.add(id);
    }
    for (const c of n.namedChildren) collectNestedParams(c);
  };

  collectBound(defNode);
  collectNestedParams(defNode);

  const walkUsed = (n: Parser.SyntaxNode) => {
    // skip the property side of member/call expressions (that's not a free var)
    if (n.type === "identifier") used.add(n.text);
    for (const c of n.namedChildren) {
      // don't descend into property_identifier positions (already excluded by type)
      walkUsed(c);
    }
  };
  walkUsed(defNode);

  const free: string[] = [];
  let dangerRef: string | null = null;
  for (const name of used) {
    if (bound.has(name) || BUILTINS.has(name)) continue;
    if (DANGER.has(name)) { dangerRef = dangerRef ?? name; continue; }
    free.push(name);
  }
  return { freeRefs: free, dangerRef };
}

// python: value/params fields live on function_definition / class_definition
export function extractFacts(
  tree: Parser.Tree,
  query: Parser.Query,
  lang: Lang,
  path: string,
): FileFacts {
  const root = tree.rootNode;
  const symbols: SymbolDef[] = [];
  const rawCalls: RawCall[] = [];
  const heritage: RawHeritage[] = [];
  const imports: FileFacts["imports"] = [];
  const exportedNames = new Set<string>();
  const isPy = lang === "python";

  // disambiguate duplicate ids
  const seen = new Map<string, number>();
  const mkId = (base: string) => {
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}@${n}`;
  };

  const addSymbol = (
    nameNode: Parser.SyntaxNode,
    defNode: Parser.SyntaxNode,
    kind: SymbolKind,
    paramsNode: Parser.SyntaxNode | null,
    className?: string,
  ): SymbolDef => {
    const name = nameNode.text;
    const start = defNode.startPosition.row + 1;
    const end = defNode.endPosition.row + 1;
    const idBase = className ? `${path}::${className}.${name}` : `${path}::${name}`;
    const exported = isPy ? !name.startsWith("_") : isExportedByAncestor(defNode);
    const params = paramNames(paramsNode);
    const sym: SymbolDef = {
      id: mkId(idBase),
      name,
      kind,
      file: path,
      startLine: start,
      endLine: end,
      lines: end - start + 1,
      params,
      className,
      exported,
      signature: firstLine(defNode),
    };
    // only standalone functions/arrows carry runnable source (methods need a class)
    if ((kind === "function" || kind === "arrow") && end - start < 200) {
      sym.source = stripTypes(defNode, lang);
      const { freeRefs, dangerRef } = analyzeRunnability(defNode, lang, params);
      sym.freeRefs = freeRefs;
      sym.dangerRef = dangerRef;
    }
    symbols.push(sym);
    return sym;
  };

  for (const m of query.matches(root)) {
    // dispatch by which def capture is present
    const fnDef = cap(m, "fn.def");
    const arrowDef = cap(m, "arrow.def");
    const methodDef = cap(m, "method.def");
    const classDef = cap(m, "class.def");
    const importDef = cap(m, "import.def");
    const pyImportDef = cap(m, "pyimport.def");
    const importSource = cap(m, "import.source");
    const exportName = cap(m, "export.name");
    const callIdDef = cap(m, "callid.def");
    const callMemberDef = cap(m, "callmember.def");
    const callNewDef = cap(m, "callnew.def");

    if (fnDef) {
      const nameNode = cap(m, "fn.name")!;
      const params = fnDef.childForFieldName("parameters");
      const cls = isPy ? enclosingClassName(fnDef) : undefined;
      addSymbol(nameNode, fnDef, cls ? "method" : "function", params, cls);
    } else if (arrowDef) {
      const nameNode = cap(m, "arrow.name")!;
      const value = arrowDef.childForFieldName("value");
      const params =
        value?.childForFieldName("parameters") ?? value?.childForFieldName("parameter") ?? null;
      addSymbol(nameNode, arrowDef, "arrow", params);
    } else if (methodDef) {
      const nameNode = cap(m, "method.name")!;
      const params = methodDef.childForFieldName("parameters");
      addSymbol(nameNode, methodDef, "method", params, enclosingClassName(methodDef));
    } else if (classDef) {
      const nameNode = cap(m, "class.name")!;
      const sym = addSymbol(nameNode, classDef, "class", null);
      collectHeritage(classDef, sym.id, isPy, heritage);
    } else if (importDef && importSource) {
      parseJsImport(importDef, importSource, imports);
    } else if (pyImportDef) {
      parsePyImport(pyImportDef, imports);
    } else if (exportName) {
      exportedNames.add(exportName.text);
    } else if (callIdDef) {
      rawCalls.push({ calleeName: cap(m, "callid.name")!.text, kind: "id", line: callIdDef.startPosition.row + 1 });
    } else if (callMemberDef) {
      rawCalls.push({ calleeName: cap(m, "callmember.name")!.text, kind: "member", line: callMemberDef.startPosition.row + 1 });
    } else if (callNewDef) {
      rawCalls.push({ calleeName: cap(m, "callnew.name")!.text, kind: "new", line: callNewDef.startPosition.row + 1 });
    }
  }

  // fold export-clause names into symbol.exported
  if (exportedNames.size) {
    for (const s of symbols) if (exportedNames.has(s.name)) s.exported = true;
  }

  return { path, lang, symbols, imports, exportedNames, rawCalls, heritage, parseError: root.hasError() };
}

function collectHeritage(
  classNode: Parser.SyntaxNode,
  subclassId: string,
  isPy: boolean,
  out: RawHeritage[],
): void {
  if (isPy) {
    // class_definition superclasses live in the argument_list
    const args = classNode.childForFieldName("superclasses");
    if (args) {
      for (const c of args.namedChildren) {
        if (c.type === "identifier" || c.type === "attribute") {
          out.push({ subclassId, superName: c.text.split(".").pop()!, kind: "extends" });
        }
      }
    }
    return;
  }
  // JS/TS: class_heritage holds extends_clause + implements_clause
  for (const child of classNode.namedChildren) {
    if (child.type === "class_heritage") {
      for (const h of child.namedChildren) {
        if (h.type === "extends_clause") {
          const v = h.childForFieldName("value") ?? h.namedChildren[0];
          if (v) out.push({ subclassId, superName: v.text.split(".").pop()!, kind: "extends" });
        } else if (h.type === "implements_clause") {
          for (const iface of h.namedChildren) {
            out.push({ subclassId, superName: iface.text.split(".").pop()!, kind: "implements" });
          }
        }
      }
    }
  }
}

function parseJsImport(
  importNode: Parser.SyntaxNode,
  sourceNode: Parser.SyntaxNode,
  out: FileFacts["imports"],
): void {
  const source = sourceNode.text.replace(/^['"`]|['"`]$/g, "");
  const clause = importNode.namedChildren.find((c) => c.type === "import_clause");
  if (!clause) return; // side-effect import
  for (const part of clause.namedChildren) {
    if (part.type === "identifier") {
      out.push({ local: part.text, imported: "default", source, resolvedFile: null, external: false });
    } else if (part.type === "namespace_import") {
      const id = part.namedChildren[0];
      if (id) out.push({ local: id.text, imported: "*", source, resolvedFile: null, external: false });
    } else if (part.type === "named_imports") {
      for (const spec of part.namedChildren) {
        if (spec.type !== "import_specifier") continue;
        const nameNode = spec.childForFieldName("name");
        const aliasNode = spec.childForFieldName("alias");
        const imported = nameNode?.text ?? "";
        const local = aliasNode?.text ?? imported;
        if (imported) out.push({ local, imported, source, resolvedFile: null, external: false });
      }
    }
  }
}

function parsePyImport(node: Parser.SyntaxNode, out: FileFacts["imports"]): void {
  // best-effort: record module names so external detection works
  if (node.type === "import_from_statement") {
    const mod = node.childForFieldName("module_name");
    const source = mod?.text ?? "";
    for (const c of node.namedChildren) {
      if (c.type === "dotted_name" && c !== mod) {
        out.push({ local: c.text, imported: c.text, source, resolvedFile: null, external: false });
      } else if (c.type === "aliased_import") {
        const name = c.namedChildren[0]?.text ?? "";
        const alias = c.childForFieldName("alias")?.text ?? name;
        if (name) out.push({ local: alias, imported: name, source, resolvedFile: null, external: false });
      }
    }
  } else {
    for (const c of node.namedChildren) {
      const name = c.type === "aliased_import" ? c.namedChildren[0]?.text : c.text;
      if (name) out.push({ local: name, imported: name, source: name, resolvedFile: null, external: false });
    }
  }
}
