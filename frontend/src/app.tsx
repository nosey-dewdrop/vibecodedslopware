import { useEffect, useState } from "preact/hooks";
import { initConfetti, refreshColors, buildField } from "./confetti";

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

function MapScreen({ owner, repo }: { owner: string; repo: string }) {
  return (
    <main>
      <h1>{owner}/{repo}</h1>
      <div class="stage-card">
        <p class="label">stage 1.3 — under construction</p>
        <p>the analyzer lands here next: this screen will fetch the repo in your
        browser, parse it with tree-sitter, and draw the map of your code.</p>
        <p class="hint">the parsing engine is already proven — see <a href="../lab/">lab 1.1</a>.</p>
      </div>
      <p style="margin-top: 16px"><a href="#/">← try another repo</a></p>
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
