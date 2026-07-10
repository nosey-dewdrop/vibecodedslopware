import { useEffect, useRef, useState } from "preact/hooks";
import { initConfetti, refreshColors, buildField, burst } from "./confetti";
import { fetchRepo, RepoFetchError, type RepoFetchResult } from "./repo";

const THEMES = ["white", "black", "plum", "midnight"] as const;

// accepts "owner/repo", full github urls, with or without .git
function parseRepoInput(raw: string): { owner: string; repo: string } | null {
  const s = raw.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\.git$/, "").replace(/\/+$/, "");
  const m = s.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

function useHashRoute(): string {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onChange = () => setHash(location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function Header() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? "white");
  const cycle = () => {
    const next = THEMES[(THEMES.indexOf(theme as typeof THEMES[number]) + 1) % THEMES.length];
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
    refreshColors();
    buildField();
  };
  return (
    <header class="top">
      <a class="wordmark" href="../">vibecodedflopware</a>
      <span class="top-right">
        <button class="theme-toggle" onClick={cycle}>[{theme}]</button>
        <a class="top-link" href="https://github.com/damlahelloworld/vibecodedflopware">github ↗</a>
      </span>
    </header>
  );
}

function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [bad, setBad] = useState(false);

  const go = () => {
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError('that does not look like a repo. try "owner/repo" or a github url.');
      setBad(true);
      setTimeout(() => setBad(false), 350);
      return;
    }
    setError("");
    location.hash = `#/map/${parsed.owner}/${parsed.repo}`;
  };

  return (
    <main>
      <h1>which repo do you want to actually own?</h1>
      <p class="hint">public github repos for now. analyzed 100% in your browser — your code never reaches a server.</p>
      <div class="prompt-row">
        <span class="prompt-caret">&gt;</span>
        <input
          class={"prompt-input" + (bad ? " bad" : "")}
          placeholder="owner/repo or github url"
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          autoFocus
        />
        <button class="btn" onClick={go}>analyze</button>
      </div>
      <p class={"msg" + (error ? " err" : "")}>{error}</p>
    </main>
  );
}

// session cache so navigating back does not refetch (real persistence: stage 1.6)
const repoCache = new Map<string, RepoFetchResult>();

const fmtKB = (n: number) => (n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");

function MapScreen({ owner, repo }: { owner: string; repo: string }) {
  const key = `${owner}/${repo}`;
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<RepoFetchResult | null>(repoCache.get(key) ?? null);
  const [error, setError] = useState<string>("");
  const started = useRef(false);

  const addLog = (line: string) => setLog((l) => [...l, line]);

  useEffect(() => {
    if (result || started.current) return;
    started.current = true;
    const t0 = performance.now();
    addLog(`> analyzing ${key}`);
    fetchRepo({ owner, repo }, (p) => {
      if (p.phase === "meta") addLog("✱ resolving repo…");
      if (p.phase === "tree") addLog("✱ reading file tree…");
      if (p.phase === "files") setProgress(`· fetching ${p.done}/${p.total} — ${p.path}`);
    })
      .then((r) => {
        setProgress("");
        addLog(`+ ${r.files.length} source files (${fmtKB(r.files.reduce((s, f) => s + f.size, 0))}) · ${r.skipped.length} skipped`);
        if (r.treeTruncated) addLog("· note: repo tree was truncated by github (very large repo)");
        addLog(`done in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
        repoCache.set(key, r);
        setResult(r);
        burst(window.innerWidth / 2, 180, 26);
      })
      .catch((e: unknown) => {
        setProgress("");
        if (e instanceof RepoFetchError) {
          if (e.kind === "rate-limit" && e.resetAt) {
            setError(`github rate limit hit — try again after ${e.resetAt.toLocaleTimeString()}`);
          } else {
            setError(e.message);
          }
        } else {
          setError("something unexpected broke. try again?");
        }
      });
  }, []);

  const skippedByReason = new Map<string, number>();
  result?.skipped.forEach((s) => skippedByReason.set(s.reason, (skippedByReason.get(s.reason) ?? 0) + 1));

  return (
    <main>
      <h1>{owner}/{repo}</h1>

      {!result && (
        <div class="log">
          {log.map((l) => <p class="log-line">{l}</p>)}
          {progress && <p class="log-line hint">{progress}</p>}
          {error && (
            <>
              <p class="log-line err">✱ {error}</p>
              <p class="log-line"><a href="#/">← try another repo</a></p>
            </>
          )}
        </div>
      )}

      {result && (
        <>
          <p class="hint">
            branch {result.branch} · {result.files.length} source files ·{" "}
            {fmtKB(result.files.reduce((s, f) => s + f.size, 0))} of code, all living in this tab only
          </p>
          <div class="result-grid">
            <div>
              <p class="label">source files</p>
              <div class="filelist">
                {result.files.slice(0, 300).map((f) => (
                  <div class="filerow">
                    <span class="filepath">{f.path}</span>
                    <span class="filesize">{fmtKB(f.size)}</span>
                  </div>
                ))}
                {result.files.length > 300 && <p class="hint">… and {result.files.length - 300} more</p>}
              </div>
            </div>
            <div>
              <p class="label">skipped ({result.skipped.length}) — nothing vanishes silently</p>
              {[...skippedByReason.entries()].map(([reason, count]) => (
                <p class="skiprow"><span class="skipcount">{count}</span> {reason}</p>
              ))}
              <div class="stage-card">
                <p class="label">next — stage 1.4</p>
                <p>tree-sitter reads these files and resolves who calls whom.
                the map grows here.</p>
              </div>
            </div>
          </div>
          <p style="margin-top: 16px"><a href="#/">← try another repo</a></p>
        </>
      )}
    </main>
  );
}

export function App() {
  useEffect(() => { initConfetti(); }, []);
  const hash = useHashRoute();
  const mapMatch = hash.match(/^#\/map\/([^/]+)\/([^/]+)$/);
  return (
    <>
      <div id="confetti-field" aria-hidden="true"></div>
      <div id="confetti-trail" aria-hidden="true"></div>
      <Header />
      {mapMatch ? <MapScreen owner={mapMatch[1]} repo={mapMatch[2]} /> : <Home />}
    </>
  );
}
