import { useEffect, useRef, useState } from "preact/hooks";
import { initConfetti, refreshColors, buildField, burst } from "./confetti";
import { fetchRepo, RepoFetchError } from "./repo";
import { analyzeFiles } from "./analyzer";
import type { RepoMap } from "./analyzer/types";
import { RepoExplorer } from "./map";

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

// session cache so navigating back does not refetch/reanalyze (persistence: 1.6)
const mapCache = new Map<string, RepoMap>();

function MapScreen({ owner, repo }: { owner: string; repo: string }) {
  const key = `${owner}/${repo}`;
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState("");
  const [map, setMap] = useState<RepoMap | null>(mapCache.get(key) ?? null);
  const [error, setError] = useState<string>("");
  const started = useRef(false);

  const addLog = (line: string) => setLog((l) => [...l, line]);

  useEffect(() => {
    if (map || started.current) return;
    started.current = true;
    const t0 = performance.now();
    addLog(`> ${key}`);

    fetchRepo({ owner, repo }, (p) => {
      if (p.phase === "meta") addLog("✱ resolving repo…");
      if (p.phase === "tree") addLog("✱ reading file tree…");
      if (p.phase === "files") setProgress(`· fetching ${p.done}/${p.total} — ${p.path}`);
    })
      .then((r) => {
        setProgress("");
        const kb = r.files.reduce((s, f) => s + f.size, 0);
        addLog(`+ ${r.files.length} files (${kb >= 1e6 ? (kb / 1e6).toFixed(1) + "mb" : Math.round(kb / 1024) + "kb"}) · ${r.skipped.length} skipped`);
        addLog("✱ parsing with tree-sitter, resolving who calls whom…");
        return analyzeFiles(r.files, (p) => setProgress(`· analyzing ${p.done}/${p.total}`));
      })
      .then((m) => {
        setProgress("");
        addLog(`+ ${m.symbols.length} symbols · ${m.stats.directCalls} calls resolved · ${m.callEdges.length} edges`);
        if (m.unsupported.length) addLog(`· ${m.unsupported.length} files in languages we don't read yet`);
        addLog(`done in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
        mapCache.set(key, m);
        setTimeout(() => {
          setMap(m);
          burst(window.innerWidth / 2, 160, 30);
        }, 300);
      })
      .catch((e: unknown) => {
        setProgress("");
        if (e instanceof RepoFetchError && e.kind === "rate-limit" && e.resetAt) {
          setError(`github rate limit hit — try again after ${e.resetAt.toLocaleTimeString()}`);
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("something unexpected broke. try again?");
        }
      });
  }, []);

  if (map) return <RepoExplorer map={map} owner={owner} repo={repo} />;

  return (
    <main>
      <h1>{owner}/{repo}</h1>
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
      <footer class="app-footer">
        <span>your code stays in this tab · <a href="../privacy.html">privacy</a></span>
        <span class="footer-glyphs" aria-hidden="true">+ ✱ ▪</span>
      </footer>
    </>
  );
}
