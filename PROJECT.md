# vibecodedflopware

Next-gen LeetCode: every question is generated from YOUR own codebase. Connect a
repo, get a map of your code, get quizzed on it until you own what you shipped.
Code is never stored server-side — analyzed in the browser, questions live on
the device, our DB keeps numbers only.

## Status
Current phase: Phase 2 (understanding engine) COMPLETE. Phase 3 (question engine) next.
Last session: 2026-07-10 — FULL analyzer live: paste repo -> browser fetch ->
tree-sitter parse (JS/TS/TSX/Python) -> resolved call graph with confidence ->
explorer with neighborhood graph. Privacy/KVKK page shipped.

## Roadmap

### Phase 1: Analyzer core — "paste a repo, see your code as a map"

#### 1.1 Mini proof (the risk killer — do this FIRST)
Goal: kill the project's only real unknown in one sitting.
- [x] plain HTML page (no framework yet) that loads `web-tree-sitter` WASM
- [x] load the JavaScript grammar `.wasm` (vendored in `lab/vendor/`,
      web-tree-sitter 0.20.8 + tree-sitter-javascript 0.20.3)
- [x] paste-a-file textarea → parse → print every function name + line number
      (`lab/index.html`, live at /lab/)
- [x] measure: parse time for a 500-line file — 541 lines in 7ms (node proof,
      target was <100ms)
Done when: a pasted JS file shows its function list in the browser, offline.
Status: built + node-proven 2026-07-10, awaiting Damla's browser check.
You learn: **WebAssembly** (what WASM is, why it lets C code run in a browser),
**AST**s (abstract syntax trees — how every IDE and compiler sees code),
**tree-sitter queries** (pattern matching over syntax trees).

#### 1.2 App scaffold
Goal: real project skeleton the rest builds on.
- [x] Vite + TypeScript + Preact (source in `frontend/`, build output committed
      to `app/`, served at /app/)
- [x] routing: hash-based — `#/` (enter repo, validated input), `#/map/o/r`
      (map placeholder pointing at 1.3), invalid hash falls back to home
- [x] landing design tokens ported (4 themes + cycler, confetti field/trail/
      burst as typed module)
- [x] deployed to GitHub Pages alongside the landing
Done when: empty app deploys and shares the landing's look. ✓ 2026-07-10
Note: stray postcss config in home dir broke the first build — solved with
inline `css.postcss` in vite.config.ts.
You learn: **Vite** (modern build tooling, dev server, why bundlers exist),
**TypeScript** (types as bug prevention), **Preact/components** (UI as a
function of state), **SPA routing on static hosting**.

#### 1.3 Repo fetching in the browser
Goal: type `owner/repo` → file tree in memory, zero servers.
- [x] PLAN CHANGE (real-world lesson): the tarball endpoint is CORS-blocked
      (codeload only allows github's own origin) — verified with curl.
      New route, actually better: git Trees API (1 call, full file list WITH
      sizes) → filter BEFORE downloading → bodies from
      raw.githubusercontent.com (CORS *), 12 parallel fetches
- [x] filters: node_modules/dist/build/.git/etc, lockfiles, binary
      extensions, >200KB per file, 15MB repo budget, 2000-file cap;
      "skipped report" grouped by reason so nothing vanishes silently
- [x] null-byte sniff for binary content that slipped past extension filter
- [x] edge cases handled: repo not found/private, empty repo, rate limit
      (shows reset time), truncated tree, per-file fetch failures, offline
- [x] analyze screen: terminal-log lines while working, confetti burst on
      done, file list + skipped summary, session cache (no refetch on back)
Done when: any public repo becomes a filtered in-memory file list with sizes.
✓ 2026-07-10
You learn: **HTTP APIs for real** (headers, rate limits, quotas),
**CORS & the same-origin policy** (the tarball lesson — why the browser
blocked us and how to design around it), **concurrency budgeting**
(12-way parallel fetch with a worker-pool loop).

#### 1.4 Multi-file analysis → resolved code graph  ✓ 2026-07-10
Goal: not just "what's in each file" but RESOLVED relationships — which call
goes to which function, across files.
- [x] per-file FACTS extraction in a Web Worker (tree-sitter queries):
      exports, imports, declarations (functions/arrows/classes/methods with
      spans + params), call sites, class heritage (extends/implements)
      — `analyzer/extract.ts`, `analyzer/queries.ts`
- [x] grammars: JS, TS, TSX, Python (vendored wasm in `public/wasm/`,
      lazy-loaded per language, node-verified compatible with web-tree-sitter)
- [x] import binding: relative path + extension trial (.ts/.tsx/.js/index.*),
      ts esm .js→.ts, bare specifiers marked external — `analyzer/resolve.ts`
- [x] call binding with CONFIDENCE TAGS: direct (local/imported named call) /
      heuristic (name match, fan-out capped) / unresolved (dynamic/external)
- [x] class relations from the same resolver (extends/implements)
- [x] module grouping by directory; external SERVICE detection (supabase/
      stripe/ai/db surfaced separately from packages)
- [x] runs in a CLASSIC web worker (emscripten env-detection fix documented)
- [x] node-proven on the app's own source: cross-file binding correct
      (fetchRepo→MapScreen direct, burst→2 callers direct, etc.)
Done when: a repo parses fully and "who calls X" answers with confidence
labels. ✓
You learn: **Web Workers**, **program analysis** (symbol tables, scopes,
call graphs, why dynamic dispatch is hard), **CORS/worker environments**,
**data modeling**.

#### 1.5 The map screen — explorer  ✓ 2026-07-10 (v1)
Goal: the "wow" screen. NOT UML, NOT a whole-repo hairball. Zoomable
hierarchy, plain labels, every view ends in an action. `map.tsx`
- [x] stats + honest confidence bar (% resolved / guessed / dynamic)
- [x] left: external services + packages ("talks to"), collapsible modules,
      symbols ranked by inbound callers
- [x] right: symbol detail — signature, file:line, params, exported badge
- [x] MINI NEIGHBORHOOD GRAPH (the Obsidian touch): callers ← symbol → callees
      as an SVG, edge style = confidence (solid/dashed/dotted), nodes clickable
- [x] callers/callees lists, click to navigate the graph
- [x] fuzzy search over all symbols/files
- [x] confetti burst on analysis complete; empty/error states
- [ ] LATER (polish): elkjs force "galaxy" overview, level-2 module dep graph,
      verb-labeled system diagram, "quiz me" wired to Phase 3
Done when: Damla explores one of her own repos and it feels like a product.
You learn: **information design**, **fuzzy search**, SVG graph drawing,
state without a library.

#### 1.6 Local persistence  ✓ 2026-07-10
Goal: close the tab, come back, map is instantly there.
- [x] Dexie (IndexedDB) `repos` table, versioned schema — `db.ts`
- [x] analyzed map saved after analysis; reopening loads from device instantly
      ("+ loaded from this device" instead of re-fetching)
- [x] home shows "on this device" recents (symbol count + time ago), click to
      reopen, each with a "forget" that deletes every trace
- [x] explorer: "re-analyze" (fresh fetch) + "forget" (wipe + go home)
- [x] the Snapchat promise made provable: forget = row deleted from IndexedDB
Done when: reload = instant map; delete = truly gone. ✓
You learn: **IndexedDB/Dexie** (the browser's real database), schema
versioning, what "data at rest" means physically.

### Phase 1 COMPLETE 2026-07-10 — the analyzer is a real product.
Live: paste any public repo → browser-only fetch → tree-sitter parse
(JS/TS/TSX/Python) → resolved call graph with confidence → explorer with
neighborhood graph → saved on-device, forgettable. Privacy/KVKK shipped.

### Phase 2: Understanding engine — "change this method and see what breaks"
(NEW 2026-07-10, Damla's expanded vision. Research-backed: Worker sandbox +
Stryker/PIT mutator subset + fast-check differential testing.)

#### 2.1 Sandbox runner  ✓ 2026-07-10
- [x] fresh classic Web Worker per run (`engine/sandbox.worker.ts` +
      `sandbox.ts`): fetch/XHR/WebSocket/storage stubbed to throw, hard
      deadline + worker.terminate() kills infinite loops, fresh state per run
- [x] result marshalling: serialized value / thrown error type / timeout /
      compile-error; `new Function` confined to the worker (verified by grep)
Done when: an infinite loop cannot freeze the app and fetch cannot fire. ✓
You learn: **sandboxing & threat models** (we run the user's own code back
at them), workers as kill-switchable VMs.

#### 2.2 Runnability classifier  ✓ 2026-07-10
- [x] at extraction: full source + free-identifier analysis (scope-aware:
      params, locals, destructuring, for-of vars, catch params, nested fn
      params all counted as bound) → freeRefs + first DANGER global touched
- [x] TS/TSX type-stripping via tree-sitter (type_annotation, type_parameters,
      as/satisfies, non-null `!`, optional `?`) → runnable JS; graceful
      fallback if a mutant won't compile
- [x] bundle builder resolves freeRefs to same-file pure helpers transitively;
      rejects anything touching imports/DOM/globals
- [x] PROVEN on the app's own TS/TSX source: 35/102 symbols runnable, all 35
      eval clean, 0 false "runnable" promises
Done when: classifier is honest — zero functions falsely promised. ✓
You learn: **program analysis for effects**, scope analysis, TS type systems.

#### 2.3 Mutation + differential harness  ✓ 2026-07-10
- [x] 5 high-signal mutators (`engine/mutators.ts`): boundary (< → <=),
      negate (=== → !==), arithmetic (+ → -), logical (&& → ||), boolean
      flip — with a tokenizer that skips strings/comments/regex/templates
- [x] input generation (`engine/inputs.ts`): name-based corpus + LITERAL
      HARVESTING (pulls `18` out of `age >= 18` and tries 17/18/19 — closes
      the boundary recall gap that a fixed corpus misses)
- [x] differential run: original vs mutant across inputs → first breaking
      input with before/after ("changing >= to > breaks isAdult(18): was
      true, now false"); equivalent mutants correctly survive (no false kills)
Done when: pick a function, see a true breaking input. ✓ (isAdult/fizz/grade
node-proven)
You learn: **mutation testing**, differential testing, tokenizers.

#### 2.4 Static blast radius  ✓ 2026-07-10
- [x] transitive callers via BFS over the resolved graph (`computeBlast`):
      "touch this → ripples to N functions", depth-tagged, capped
- [x] rendered as chips in the what-if panel
Done when: blast radius of a popular util renders. ✓
You learn: **graph traversal**, impact analysis.

#### 2.5 "What if" panel  ✓ 2026-07-10 (`whatif-panel.tsx`)
- [x] on any function: blast radius shown instantly; "break it on purpose"
      button runs the real experiment in the sandbox
- [x] shows changes that break it (with the exact input + before/after) and
      changes nothing noticed ("your tests wouldn't catch this"), confetti
      burst when a break is found
- [ ] LATER: predict-before-reveal quiz framing (Phase 3), "follow one action"
      flow view
Done when: the predict-then-watch loop feels like the signature move. ✓ (v1)
You learn: turning analysis into pedagogy.

### Phase 3: Question engine — "the map becomes a curriculum"
Question types now consume Phases 1-2: "what does this return" answers are
SANDBOX-VERIFIED (no LLM guessing — Miss Ducky quality rule), bug-injection
mutants come from 2.3, architecture questions from the resolved graph.

#### 3.1 The code-blind proxy
Goal: the ONLY server piece — an LLM pass-through that never persists code.
- [ ] Supabase Edge Function `generate-questions`: JWT-gated, rate-limited,
      forwards snippet+context to Anthropic API, streams JSON back
- [ ] zero logging of bodies (verify: nothing in Supabase logs), API key
      server-side only
Done when: a snippet goes in, a question comes back, logs show only counts.
You learn: **edge functions/serverless** (Deno), **API key security**,
**rate limiting**, what "zero retention" means technically and legally.

#### 3.2 Question generation
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

### Phase 4: Quiz experience — "the leetcode feeling, but yours"

#### 4.1 Quiz screen
- [ ] one question at a time, keyboard-first (1/2/3 answer, enter next)
- [ ] instant feedback with explanation, confetti burst on correct
- [ ] wrong answer → question requeues with spaced repetition intervals
Done when: a 10-question session feels smooth with hands on keyboard only.
You learn: **SRS** (spaced repetition — the memory science behind Anki),
keyboard UX, animation timing.

#### 4.2 Mastery model
- [ ] per module: mastery % = weighted unique-correct / total, difficulty-weighted
- [ ] per repo dashboard: "you own 40% of kisalafinuzunu", per-module bars
- [ ] daily streak, XP, session summary screen
Done when: numbers move believably and honestly (no fake progress feel).
You learn: **scoring model design** (the math IS the product here),
gamification psychology done honestly.

#### 4.3 Full CRUD + edge cases
- [ ] every action reversible: reset module, reset repo, delete everything
- [ ] empty states for every screen, offline behavior (app works offline
      after analysis — it's all local)
Done when: common-sense check passes on every screen.

### Phase 5: Accounts — "numbers survive devices, code never leaves them"
- [ ] shared damlahelloworld Supabase: auth, RLS on from day one, e2e-tested
      (same discipline as Sıra Sende's 6/6)
- [ ] tables: `profiles`, `repo_progress` (hashed repo id, mastery, counts),
      `streaks` — no code, no filenames, no repo names
- [ ] GitHub OAuth PKCE for private repos (token in sessionStorage only)
- [ ] privacy policy + consent SAME session this ships (KVKK/GDPR; the
      zero-storage claim is a legal claim — it must be exactly true)
You learn: **OAuth PKCE** (auth without a server secret), **RLS** (database
rows that protect themselves), **hashing** as privacy tool, GDPR/KVKK basics.

### Phase 6: Launch polish — "en iyi şekilde bitmeli"
- [ ] onboarding: first visit auto-analyzes a tiny demo repo — the magic in
      30 seconds with zero setup
- [ ] full ship-check (edge cases, a11y, performance, Five Doors, EN copy)
- [ ] perf pass: lazy WASM, bundle budget, Lighthouse 90+
- [ ] share card: "i own 73% of my codebase" (numbers only, safe to share)
You learn: **shipping discipline** — the last 10% that separates a repo
from a product.

## Technologies you will have learned by the end
WebAssembly, ASTs & parsing (tree-sitter), program analysis (symbol tables,
call graphs, purity, confidence), Web Workers, sandboxing & threat models,
mutation testing, property-based testing + shrinking (fast-check), binary
formats (tar/gzip), HTTP APIs & rate limits, TypeScript, Vite, Preact,
IndexedDB, graph layout (elk / C4 model), fuzzy search, serverless edge
functions (Deno), LLM structured output & cost design, spaced repetition,
scoring models, OAuth PKCE, Supabase RLS, hashing & privacy engineering,
GDPR/KVKK, performance budgets. Roughly a semester of practical systems
courses, attached to a product you own.

## Status update note (2026-07-10, token tap open)
Understanding-engine research done by 3 parallel agents; synthesis report at
~/damla_projects_2026/reports/2026-07-10-vibecodedflopware-understanding-engine.md.
Plan restructured: new Phase 2 (understanding engine) inserted; question
engine moved to Phase 3 and now consumes sandbox-verified answers.

## Ideas
- leaderboard + hiring signal ("owns 90% of their codebase") — Damla wants,
  needs anti-cheat design first
- community: unite vibecoders (Damla 2026-07-10)
- free-text answers, multiplayer (quiz a friend's repo), editor plugin,
  CI badge, "explain this function" graded by LLM

## Bugs / Issues
- (none yet — app not started)
