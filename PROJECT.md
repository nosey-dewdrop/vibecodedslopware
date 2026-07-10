# vibecodedflopware

Next-gen LeetCode: every question is generated from YOUR own codebase. Connect a
repo, get a map of your code, get quizzed on it until you own what you shipped.
Code is never stored server-side — analyzed in the browser, questions live on
the device, our DB keeps numbers only.

## Status
Current phase: Foundation (Phase 1 not started)
Last session: 2026-07-10 — landing live (white/black terminal, confetti,
typing hero, no bold anywhere), design rules locked, this plan written.

## Roadmap

### Phase 1: Analyzer core — "paste a repo, see your code as a map"

#### 1.1 Mini proof (the risk killer — do this FIRST)
Goal: kill the project's only real unknown in one sitting.
- [ ] plain HTML page (no framework yet) that loads `web-tree-sitter` WASM
- [ ] load the JavaScript grammar `.wasm`
- [ ] paste-a-file textarea → parse → print every function name + line number
- [ ] measure: parse time for a 500-line file (target: under 100ms)
Done when: a pasted JS file shows its function list in the browser, offline.
You learn: **WebAssembly** (what WASM is, why it lets C code run in a browser),
**AST**s (abstract syntax trees — how every IDE and compiler sees code),
**tree-sitter queries** (pattern matching over syntax trees).

#### 1.2 App scaffold
Goal: real project skeleton the rest builds on.
- [ ] `app/` folder: Vite + TypeScript + Preact
- [ ] routing: `/` (enter repo), `/map` (the map), 404
- [ ] port the landing design tokens (CSS vars, both themes, confetti layer)
- [ ] deploy `app/` build to GitHub Pages alongside the landing
Done when: empty app deploys and shares the landing's look.
You learn: **Vite** (modern build tooling, dev server, why bundlers exist),
**TypeScript** (types as bug prevention), **Preact/components** (UI as a
function of state), **SPA routing on static hosting**.

#### 1.3 Repo fetching in the browser
Goal: type `owner/repo` → file tree in memory, zero servers.
- [ ] GitHub REST: fetch tarball of default branch
- [ ] decompress gzip with `fflate`, read tar format (write the ~40-line
      tar reader ourselves — it's a beautifully simple binary format)
- [ ] filters: skip binaries, `node_modules`, lockfiles, generated dirs,
      files > 200KB; keep a "skipped report" so nothing vanishes silently
- [ ] edge cases: repo not found, empty repo, rate limit (show remaining
      quota + reset time), huge repo (cap + warn), no default branch
Done when: any public repo becomes a filtered in-memory file list with sizes.
You learn: **HTTP APIs for real** (headers, rate limits, auth-less quotas),
**binary formats** (gzip, tar — reading bytes, offsets, padding),
**streaming/memory thinking** (why we filter before parsing).

#### 1.4 Multi-file analysis → structure map
Goal: the whole repo parsed into one data structure.
- [ ] language detection by extension; lazy-load only needed grammars
      (JS, TS, Python, Swift at launch)
- [ ] per file extract: imports, classes, functions (name, params, lines,
      body size), top-level constants
- [ ] call-site extraction: which function mentions which
- [ ] module grouping v1: by directory; store everything as one typed
      `RepoMap` object
- [ ] parse in a Web Worker so the UI never freezes; progress bar per file
Done when: kisalafinuzunu parses fully with a progress bar and a RepoMap in memory.
You learn: **Web Workers** (real multithreading in the browser),
**data modeling** (designing the RepoMap type is an architecture exercise),
**call graphs** (the data structure behind "who calls whom").

#### 1.5 The map screen
Goal: the "wow" screen — your repo as a place, not a file list.
- [ ] module cards (directory = card): file count, function count, top
      functions by how often they're called
- [ ] click a function → detail panel: signature, callers, callees, size
- [ ] search box (fuzzy) over all symbols
- [ ] confetti burst when analysis completes; empty/error states designed
Done when: Damla explores one of her own repos and it feels like a product.
You learn: **information design** (turning a graph into something readable),
**fuzzy search** algorithms, state management without a library.

#### 1.6 Local persistence
Goal: close the tab, come back, map is instantly there.
- [ ] Dexie (IndexedDB): `repos` + `symbols` tables, versioned schema
- [ ] "delete repo" wipes every local trace (the Snapchat promise, provable)
- [ ] re-analyze button (repo changed upstream)
Done when: reload = instant map; delete = truly gone (verified in devtools).
You learn: **IndexedDB/Dexie** (the browser's real database), schema
versioning/migrations, what "data at rest" means physically.

### Phase 2: Question engine — "the map becomes a curriculum"

#### 2.1 The code-blind proxy
Goal: the ONLY server piece — an LLM pass-through that never persists code.
- [ ] Supabase Edge Function `generate-questions`: JWT-gated, rate-limited,
      forwards snippet+context to Anthropic API, streams JSON back
- [ ] zero logging of bodies (verify: nothing in Supabase logs), API key
      server-side only
Done when: a snippet goes in, a question comes back, logs show only counts.
You learn: **edge functions/serverless** (Deno), **API key security**,
**rate limiting**, what "zero retention" means technically and legally.

#### 2.2 Question generation
Goal: four question types, generated in one batch at analysis time.
- [ ] candidate scoring: which functions deserve questions (called often,
      has real logic, not config/boilerplate)
- [ ] prompts per type with forced JSON schema output:
      code reading (predict output), fill-the-blank (real line, one hole),
      architecture (real module names as options)
- [ ] bug injection done deterministically in the browser (operator flip,
      swapped args, off-by-one) — LLM only writes the explanation. Cheap.
- [ ] quality gate: schema-validate, reject questions referencing code not
      in the snippet, dedupe, difficulty tag
- [ ] batch UI: "generating your curriculum… 34/120", cancellable, resumable
- [ ] cost guard: per-repo daily cap
Done when: a real repo yields 50+ valid questions stored in Dexie.
You learn: **prompt engineering with structured output** (JSON schema
forcing), **LLM cost design** (batch vs runtime, why Miss Ducky's bank model
wins), **mutation testing** ideas (bug injection is literally that).

### Phase 3: Quiz experience — "the leetcode feeling, but yours"

#### 3.1 Quiz screen
- [ ] one question at a time, keyboard-first (1/2/3 answer, enter next)
- [ ] instant feedback with explanation, confetti burst on correct
- [ ] wrong answer → question requeues with spaced repetition intervals
Done when: a 10-question session feels smooth with hands on keyboard only.
You learn: **SRS** (spaced repetition — the memory science behind Anki),
keyboard UX, animation timing.

#### 3.2 Mastery model
- [ ] per module: mastery % = weighted unique-correct / total, difficulty-weighted
- [ ] per repo dashboard: "you own 40% of kisalafinuzunu", per-module bars
- [ ] daily streak, XP, session summary screen
Done when: numbers move believably and honestly (no fake progress feel).
You learn: **scoring model design** (the math IS the product here),
gamification psychology done honestly.

#### 3.3 Full CRUD + edge cases
- [ ] every action reversible: reset module, reset repo, delete everything
- [ ] empty states for every screen, offline behavior (app works offline
      after analysis — it's all local)
Done when: common-sense check passes on every screen.

### Phase 4: Accounts — "numbers survive devices, code never leaves them"
- [ ] shared damlahelloworld Supabase: auth, RLS on from day one, e2e-tested
      (same discipline as Sıra Sende's 6/6)
- [ ] tables: `profiles`, `repo_progress` (hashed repo id, mastery, counts),
      `streaks` — no code, no filenames, no repo names
- [ ] GitHub OAuth PKCE for private repos (token in sessionStorage only)
- [ ] privacy policy + consent SAME session this ships (KVKK/GDPR; the
      zero-storage claim is a legal claim — it must be exactly true)
You learn: **OAuth PKCE** (auth without a server secret), **RLS** (database
rows that protect themselves), **hashing** as privacy tool, GDPR/KVKK basics.

### Phase 5: Launch polish — "en iyi şekilde bitmeli"
- [ ] onboarding: first visit auto-analyzes a tiny demo repo — the magic in
      30 seconds with zero setup
- [ ] full ship-check (edge cases, a11y, performance, Five Doors, EN copy)
- [ ] perf pass: lazy WASM, bundle budget, Lighthouse 90+
- [ ] share card: "i own 73% of my codebase" (numbers only, safe to share)
You learn: **shipping discipline** — the last 10% that separates a repo
from a product.

## Technologies you will have learned by the end
WebAssembly, ASTs & parsing (tree-sitter), Web Workers, binary formats
(tar/gzip), HTTP APIs & rate limits, TypeScript, Vite, Preact, IndexedDB,
fuzzy search, serverless edge functions (Deno), LLM structured output &
cost design, mutation testing concepts, spaced repetition, scoring models,
OAuth PKCE, Supabase RLS, hashing & privacy engineering, GDPR/KVKK,
performance budgets. Roughly a semester of practical systems courses,
attached to a product you own.

## Ideas
- leaderboard + hiring signal ("owns 90% of their codebase") — Damla wants,
  needs anti-cheat design first
- community: unite vibecoders (Damla 2026-07-10)
- free-text answers, multiplayer (quiz a friend's repo), editor plugin,
  CI badge, "explain this function" graded by LLM

## Bugs / Issues
- (none yet — app not started)
