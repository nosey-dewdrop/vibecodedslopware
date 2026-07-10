// runs the whole analysis off the main thread: parse every file with
// tree-sitter, extract facts, resolve the code graph. nothing leaves the tab.
import Parser from "web-tree-sitter";
import { extractFacts } from "./extract";
import { resolveRepo } from "./resolve";
import { langForPath, querySource } from "./queries";
import type { FileFacts, Lang, RepoMap } from "./types";

const WASM_BASE = import.meta.env.BASE_URL + "wasm/";
const GRAMMAR: Record<Lang, string> = {
  javascript: "tree-sitter-javascript.wasm",
  typescript: "tree-sitter-typescript.wasm",
  tsx: "tree-sitter-tsx.wasm",
  python: "tree-sitter-python.wasm",
};

type InFile = { path: string; text: string };
type LoadedLang = { L: Parser.Language; q: Parser.Query };

let initPromise: Promise<void> | null = null;
const langCache = new Map<Lang, LoadedLang>();
let parser: Parser | null = null;

async function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = Parser.init({ locateFile: (f: string) => WASM_BASE + f }).then(() => {
      parser = new Parser();
    });
  }
  return initPromise;
}

async function getLang(lang: Lang): Promise<LoadedLang> {
  const cached = langCache.get(lang);
  if (cached) return cached;
  const L = await Parser.Language.load(WASM_BASE + GRAMMAR[lang]);
  const q = L.query(querySource(lang));
  const loaded = { L, q };
  langCache.set(lang, loaded);
  return loaded;
}

async function analyze(files: InFile[]): Promise<RepoMap> {
  await ensureInit();
  const facts: FileFacts[] = [];
  const unsupported: { path: string; reason: string }[] = [];
  let done = 0;

  for (const file of files) {
    const lang = langForPath(file.path);
    if (!lang) {
      unsupported.push({ path: file.path, reason: "language not supported yet" });
    } else {
      try {
        const { L, q } = await getLang(lang);
        parser!.setLanguage(L);
        // tree-sitter caps at 32KB lines / very large files; guard anyway
        const tree = parser!.parse(file.text);
        facts.push(extractFacts(tree, q, lang, file.path));
        tree.delete();
      } catch (e) {
        unsupported.push({ path: file.path, reason: "failed to parse" });
      }
    }
    done++;
    if (done % 10 === 0 || done === files.length) {
      postMessage({ type: "progress", done, total: files.length, path: file.path });
    }
  }

  const map = resolveRepo(facts);
  map.unsupported = unsupported;
  return map;
}

self.onmessage = (e: MessageEvent<{ files: InFile[] }>) => {
  analyze(e.data.files)
    .then((map) => postMessage({ type: "done", map }))
    .catch((err) => postMessage({ type: "error", message: err?.message ?? "analysis failed" }));
};
