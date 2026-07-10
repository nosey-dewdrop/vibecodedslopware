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
    const sym: SymbolDef = {
      id: mkId(idBase),
      name,
      kind,
      file: path,
      startLine: start,
      endLine: end,
      lines: end - start + 1,
      params: paramNames(paramsNode),
      className,
      exported,
      signature: firstLine(defNode),
    };
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
