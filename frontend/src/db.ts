// local-only persistence. the analyzed map lives in YOUR browser's IndexedDB,
// never on our servers. deleting a repo wipes its every trace here — that is
// the snapchat promise, made provable.
import Dexie, { type EntityTable } from "dexie";
import type { RepoMap } from "./analyzer/types";

export interface StoredRepo {
  key: string; // `${owner}/${repo}`
  owner: string;
  repo: string;
  map: RepoMap;
  savedAt: number;
  fileCount: number;
  symbolCount: number;
}

const db = new Dexie("vibecodedflopware") as Dexie & {
  repos: EntityTable<StoredRepo, "key">;
};

db.version(1).stores({ repos: "key, savedAt" });

// persistence is a nicety, never a blocker. some browsers (notably Safari with
// several tabs open) can hang or reject on IndexedDB open — so every call is
// wrapped: it resolves to a safe fallback on timeout OR error, and analysis
// proceeds regardless. this is the fix for "analysis never even starts".
function guard<T>(op: () => Promise<T>, fallback: T, ms = 1500): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const done = (v: T) => { if (!settled) { settled = true; resolve(v); } };
    const timer = setTimeout(() => done(fallback), ms);
    op().then(
      (v) => { clearTimeout(timer); done(v); },
      () => { clearTimeout(timer); done(fallback); },
    );
  });
}

export async function saveRepo(owner: string, repo: string, map: RepoMap): Promise<void> {
  await guard(() => db.repos.put({
    key: `${owner}/${repo}`,
    owner,
    repo,
    map,
    savedAt: Date.now(),
    fileCount: map.files.length,
    symbolCount: map.symbols.length,
  }).then(() => undefined), undefined, 3000);
}

export async function loadRepo(owner: string, repo: string): Promise<RepoMap | null> {
  const row = await guard(() => db.repos.get(`${owner}/${repo}`), undefined);
  return row?.map ?? null;
}

export async function listRepos(): Promise<StoredRepo[]> {
  return guard(() => db.repos.orderBy("savedAt").reverse().toArray(), []);
}

export async function deleteRepo(owner: string, repo: string): Promise<void> {
  await guard(() => db.repos.delete(`${owner}/${repo}`).then(() => undefined), undefined);
}

export async function wipeEverything(): Promise<void> {
  await guard(() => db.repos.clear().then(() => undefined), undefined);
}
