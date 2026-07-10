// the resolved code graph — the data model behind "who calls whom"

export type Lang = "javascript" | "typescript" | "tsx" | "python";

export type SymbolKind = "function" | "arrow" | "method" | "class";

export interface SymbolDef {
  id: string; // `${file}::${name}` (+ `@line` when ambiguous)
  name: string;
  kind: SymbolKind;
  file: string;
  startLine: number; // 1-based
  endLine: number;
  lines: number;
  params: string[];
  className?: string; // set for methods
  exported: boolean;
  signature: string; // first line of the declaration, trimmed
}

export type Confidence = "direct" | "heuristic" | "unresolved";

export interface CallEdge {
  fromId: string; // caller symbol id, or `${file}::<module>` for top-level
  toId: string | null; // callee symbol id; null when unresolved
  calleeName: string;
  confidence: Confidence;
  line: number;
}

export interface ClassEdge {
  fromId: string; // subclass id
  toId: string | null; // superclass/interface id, null if external/unresolved
  toName: string;
  kind: "extends" | "implements";
  confidence: Confidence;
}

export interface ImportRec {
  // local alias used in this file -> what it refers to
  local: string;
  imported: string; // original exported name, or "*" for namespace, "default"
  source: string; // raw specifier
  resolvedFile: string | null; // repo file it binds to, or null (external)
  external: boolean;
}

export interface RawCall {
  calleeName: string;
  kind: "id" | "member" | "new";
  line: number;
}

export interface RawHeritage {
  subclassId: string;
  superName: string;
  kind: "extends" | "implements";
}

export interface FileFacts {
  path: string;
  lang: Lang;
  symbols: SymbolDef[];
  imports: ImportRec[];
  exportedNames: Set<string>;
  rawCalls: RawCall[];
  heritage: RawHeritage[];
  parseError: boolean;
}

export interface ModuleGroup {
  name: string; // directory path used as the module label
  files: string[];
  symbolCount: number;
}

export interface External {
  name: string; // package or service
  kind: "package" | "service";
  importedBy: number; // file count
}

export interface RepoMap {
  files: string[];
  symbols: SymbolDef[];
  callEdges: CallEdge[];
  classEdges: ClassEdge[];
  modules: ModuleGroup[];
  externals: External[];
  langCounts: Record<string, number>;
  unsupported: { path: string; reason: string }[];
  stats: {
    functions: number;
    classes: number;
    directCalls: number;
    heuristicCalls: number;
    unresolvedCalls: number;
  };
}
