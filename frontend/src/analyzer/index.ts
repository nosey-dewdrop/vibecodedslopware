import type { RepoMap } from "./types";
import type { RepoFile } from "../repo";

export type AnalyzeProgress = { done: number; total: number; path: string };

// spin up the analyzer worker, stream progress, resolve with the RepoMap
export function analyzeFiles(
  files: RepoFile[],
  onProgress: (p: AnalyzeProgress) => void,
): Promise<RepoMap> {
  return new Promise((resolve, reject) => {
    // classic (iife) worker on purpose: web-tree-sitter's emscripten glue
    // detects `importScripts` to pick the right wasm-loading path; a module
    // worker (no importScripts) makes it misdetect node and require("fs").
    const worker = new Worker(new URL("./analyzer.worker.ts", import.meta.url));
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "progress") onProgress({ done: msg.done, total: msg.total, path: msg.path });
      else if (msg.type === "done") {
        resolve(msg.map as RepoMap);
        worker.terminate();
      } else if (msg.type === "error") {
        reject(new Error(msg.message));
        worker.terminate();
      }
    };
    worker.onerror = (e) => {
      reject(new Error(e.message || "analyzer worker crashed"));
      worker.terminate();
    };
    worker.postMessage({ files: files.map((f) => ({ path: f.path, text: f.text })) });
  });
}

export type { RepoMap } from "./types";
