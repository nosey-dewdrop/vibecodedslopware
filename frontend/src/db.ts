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

export async function saveRepo(owner: string, repo: string, map: RepoMap): Promise<void> {
  await db.repos.put({
    key: `${owner}/${repo}`,
    owner,
    repo,
    map,
    savedAt: Date.now(),
    fileCount: map.files.length,
    symbolCount: map.symbols.length,
  });
}

export async function loadRepo(owner: string, repo: string): Promise<RepoMap | null> {
  const row = await db.repos.get(`${owner}/${repo}`);
  return row?.map ?? null;
}

export async function listRepos(): Promise<StoredRepo[]> {
  return db.repos.orderBy("savedAt").reverse().toArray();
}

export async function deleteRepo(owner: string, repo: string): Promise<void> {
  await db.repos.delete(`${owner}/${repo}`);
}

export async function wipeEverything(): Promise<void> {
  await db.repos.clear();
}
