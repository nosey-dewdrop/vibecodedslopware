import type { Lang } from "./types";

// tree-sitter query sources. JS/TS/TSX share the ECMAScript node names;
// python has its own grammar. Each pattern is tagged so extract.ts can switch
// on the capture role.

const JS_TS = `
; --- declarations ---
(function_declaration name: (identifier) @fn.name) @fn.def
(generator_function_declaration name: (identifier) @fn.name) @fn.def
(variable_declarator
  name: (identifier) @arrow.name
  value: [(arrow_function) (function_expression)]) @arrow.def
(method_definition name: (property_identifier) @method.name) @method.def
(class_declaration name: (_) @class.name) @class.def

; --- imports ---
(import_statement source: (string) @import.source) @import.def

; --- exports (clauses; declaration exports handled by parent-walk) ---
(export_specifier name: (identifier) @export.name)
(export_statement value: (identifier) @export.name)

; --- calls ---
(call_expression function: (identifier) @callid.name) @callid.def
(call_expression
  function: (member_expression property: (property_identifier) @callmember.name)) @callmember.def
(new_expression constructor: (identifier) @callnew.name) @callnew.def
`;

const PYTHON = `
(function_definition name: (identifier) @fn.name) @fn.def
(class_definition name: (identifier) @class.name) @class.def
(import_statement) @pyimport.def
(import_from_statement) @pyimport.def
(call function: (identifier) @callid.name) @callid.def
(call function: (attribute attribute: (identifier) @callmember.name)) @callmember.def
`;

export function querySource(lang: Lang): string {
  return lang === "python" ? PYTHON : JS_TS;
}

const EXT_LANG: Record<string, Lang> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  py: "python",
  pyi: "python",
};

export function langForPath(path: string): Lang | null {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return EXT_LANG[ext] ?? null;
}
