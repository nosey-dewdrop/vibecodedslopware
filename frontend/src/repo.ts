// stage 1.3 — fetch a public github repo entirely in the browser.
// tarball endpoint is CORS-blocked (codeload only allows github's own origin),
// so: git trees api (1 call, full file list with sizes) -> filter BEFORE
// downloading -> file bodies from raw.githubusercontent.com (CORS *).

export type RepoRef = { owner: string; repo: string };
export type RepoFile = { path: string; size: number; text: string };
export type Skipped = { path: string; size: number; reason: string };

export type RepoFetchResult = {
  ref: RepoRef;
  branch: string;
  files: RepoFile[];
  skipped: Skipped[];
  treeTruncated: boolean;
};

export type Progress =
  | { phase: "meta" }
  | { phase: "tree" }
  | { phase: "files"; done: number; total: number; path: string }
  | { phase: "done" };

export type FetchErrorKind = "not-found" | "rate-limit" | "empty" | "too-big" | "network";

export class RepoFetchError extends Error {
  kind: FetchErrorKind;
  resetAt?: Date;
  constructor(kind: FetchErrorKind, message: string, resetAt?: Date) {
    super(message);
    this.kind = kind;
    this.resetAt = resetAt;
  }
}

const SKIP_DIRS = /(^|\/)(node_modules|\.git|dist|build|out|vendor|coverage|\.next|\.nuxt|target|Pods|DerivedData|__pycache__|\.venv|venv)(\/|$)/;
const LOCKFILES = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|Cargo\.lock|Podfile\.lock|Gemfile\.lock|poetry\.lock|composer\.lock)$/;
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|icns|bmp|tiff?|mp[34]|mov|avi|webm|wav|ogg|flac|woff2?|ttf|otf|eot|pdf|zip|gz|tar|rar|7z|jar|class|wasm|exe|dll|so|dylib|a|o|bin|dat|db|sqlite|realm|keystore|p12|mobileprovision|xcuserstate|DS_Store)$/i;
const MAX_FILE_SIZE = 200 * 1024; // 200KB per file
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB text budget per repo
const MAX_FILES = 2000;
const CONCURRENCY = 12;

type TreeEntry = { path: string; type: string; size?: number };

async function ghJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  } catch {
    throw new RepoFetchError("network", "network error — are you offline?");
  }
  if (res.status === 404) throw new RepoFetchError("not-found", "repo not found (or private)");
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("x-ratelimit-reset");
    const resetAt = reset ? new Date(Number(reset) * 1000) : undefined;
    throw new RepoFetchError("rate-limit", "github rate limit hit", resetAt);
  }
  if (!res.ok) throw new RepoFetchError("network", `github answered ${res.status}`);
  return res.json();
}

function classify(entry: TreeEntry): string | null {
  const { path, size = 0 } = entry;
  if (SKIP_DIRS.test(path)) return "generated or dependency dir";
  if (LOCKFILES.test(path)) return "lockfile";
  if (BINARY_EXT.test(path)) return "binary asset";
  if (size > MAX_FILE_SIZE) return "over 200KB";
  return null;
}

export async function fetchRepo(
  ref: RepoRef,
  onProgress: (p: Progress) => void,
): Promise<RepoFetchResult> {
  const { owner, repo } = ref;

  onProgress({ phase: "meta" });
  const meta = (await ghJson(`https://api.github.com/repos/${owner}/${repo}`)) as { default_branch?: string };
  const branch = meta.default_branch;
  if (!branch) throw new RepoFetchError("empty", "repo has no default branch");

  onProgress({ phase: "tree" });
  const tree = (await ghJson(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  )) as { tree?: TreeEntry[]; truncated?: boolean };
  const blobs = (tree.tree ?? []).filter((e) => e.type === "blob");
  if (blobs.length === 0) throw new RepoFetchError("empty", "repo is empty");

  const skipped: Skipped[] = [];
  const wanted: TreeEntry[] = [];
  for (const e of blobs) {
    const reason = classify(e);
    if (reason) skipped.push({ path: e.path, size: e.size ?? 0, reason });
    else wanted.push(e);
  }

  if (wanted.length > MAX_FILES) {
    throw new RepoFetchError("too-big", `repo has ${wanted.length} source files — cap is ${MAX_FILES} for now`);
  }
  let budget = 0;
  const selected: TreeEntry[] = [];
  for (const e of wanted) {
    if (budget + (e.size ?? 0) > MAX_TOTAL_SIZE) {
      skipped.push({ path: e.path, size: e.size ?? 0, reason: "over repo budget (15MB)" });
      continue;
    }
    budget += e.size ?? 0;
    selected.push(e);
  }

  const files: RepoFile[] = [];
  let done = 0;
  const queue = [...selected];

  const worker = async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;
      const rawUrl =
        `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/` +
        entry.path.split("/").map(encodeURIComponent).join("/");
      try {
        const res = await fetch(rawUrl);
        if (!res.ok) {
          skipped.push({ path: entry.path, size: entry.size ?? 0, reason: `fetch failed (${res.status})` });
        } else {
          const text = await res.text();
          if (text.slice(0, 1000).includes("\0")) {
            skipped.push({ path: entry.path, size: entry.size ?? 0, reason: "binary content" });
          } else {
            files.push({ path: entry.path, size: entry.size ?? 0, text });
          }
        }
      } catch {
        skipped.push({ path: entry.path, size: entry.size ?? 0, reason: "fetch failed (network)" });
      }
      done++;
      onProgress({ phase: "files", done, total: selected.length, path: entry.path });
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, selected.length) }, worker));
  files.sort((a, b) => a.path.localeCompare(b.path));

  onProgress({ phase: "done" });
  return { ref, branch, files, skipped, treeTruncated: !!tree.truncated };
}
