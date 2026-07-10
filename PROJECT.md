# vibecodedflopware

Next-gen LeetCode: every question is generated from YOUR own codebase. Connect a
repo, get a map of your code, get quizzed on it until you own what you shipped.
Code is never stored server-side — analyzed in the browser, questions live on
the device, our DB keeps numbers only.

## Status
Current phase: Foundation (Phase 1 — stages 1.1, 1.2, 1.3 done, 1.4 next)
Last session: 2026-07-10 — landing final + 4 themes; 1.1 parse proof live
at /lab/ (541 lines / 7ms); 1.2 app scaffold live at /app/ (Vite+TS+Preact,
hash routing, shared design system).

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

#### 1.4 Multi-file analysis → resolved code graph
Goal: not just "what's in each file" but RESOLVED relationships — which call
goes to which function, across files. (Research 2026-07-10: SCIP-shaped
extraction + dependency-cruiser-shaped import resolution + ACG-style call
binding; see reports/2026-07-10-vibecodedflopware-understanding-engine.md)
- [ ] per-file FACTS extraction in a Web Worker (tree-sitter queries):
      exports, imports, declarations (functions/classes/methods with spans),
      call sites, class heritage (extends/implements/fields)
- [ ] drop ASTs after extraction; store fact JSON keyed by content hash
- [ ] import binding: relative path + extension trial (.ts/.tsx/.js/index.*),
      tsconfig paths, `export * from` barrel chains expanded to fixpoint,
      bare specifiers marked external
- [ ] call binding with CONFIDENCE TAGS: direct (local/imported named call,
      ~100% sure) / heuristic (obj.method() matched by name) / unresolved
      (dynamic) — never pretend certainty we don't have
- [ ] class relations from the same resolver: extends, implements, composition
      (the "UML understanding" — it's a byproduct of resolution, not a
      separate engine)
- [ ] progress bar per file; language detection; lazy grammar loading
      (JS first, TS/TSX next, Python/Swift later)
Done when: kisalafinuzunu parses fully and "who calls slugify" answers
correctly with confidence labels.
You learn: **Web Workers**, **program analysis** (symbol tables, scopes,
call graphs, why dynamic dispatch is hard), **data modeling**.

#### 1.5 The map screen — C4-lite zoomable city map
Goal: the "wow" screen. NOT UML (research: <10% usage, wrong metaphor for
JS/TS), NOT a whole-repo force graph (hairball, anti-pedagogy). Instead:
zoomable hierarchy, 10-50 nodes per view, plain-language labels.
- [ ] level 1 — system map: feature modules (grouped from folders) + external
      services (detected from package.json/imports: supabase, stripe, apis),
      verb-labeled edges ("saves users to", "calls")
- [ ] level 2 — click a module: files inside, resolved dependencies between
      them (elkjs layout in a worker, custom SVG nodes in Preact)
- [ ] level 3 — click a function: signature, callers, callees (with
      confidence), size, "quiz me on this" button
- [ ] fuzzy search over all symbols
- [ ] every view ends in an ACTION (CodeSee died shipping maps with no next
      step): "this module talks to stripe — start its quiz"
- [ ] confetti burst when analysis completes; empty/error states designed
Done when: Damla explores one of her own repos and it feels like a product.
You learn: **information design**, **graph layout** (elk, layered DAGs),
**fuzzy search**, the C4 model.

#### 1.6 Local persistence
Goal: close the tab, come back, map is instantly there.
- [ ] Dexie (IndexedDB): `repos` + `symbols` tables, versioned schema
- [ ] "delete repo" wipes every local trace (the Snapchat promise, provable)
- [ ] re-analyze button (repo changed upstream)
Done when: reload = instant map; delete = truly gone (verified in devtools).
You learn: **IndexedDB/Dexie** (the browser's real database), schema
versioning/migrations, what "data at rest" means physically.

### Phase 2: Understanding engine — "change this method and see what breaks"
(NEW 2026-07-10, Damla's expanded vision. Research-backed: Worker sandbox +
Stryker/PIT mutator subset + fast-check differential testing.)

#### 2.1 Sandbox runner
- [ ] fresh Web Worker per run (Blob URL): globals stubbed (fetch, DOM,
      storage throw SandboxViolation), 2s deadline + worker.terminate()
      (kills even infinite loops), fresh state every run
- [ ] result marshalling: value / thrown error type / timeout / violation
Done when: an infinite loop cannot freeze the app and fetch cannot fire.
You learn: **sandboxing & threat models** (we run the user's own code back
at them — that framing decides everything), workers as kill-switchable VMs.

#### 2.2 Purity classifier
- [ ] static pass over our own facts: reject free refs to window/document/
      fetch/process; imports of side-effectful modules; assignments to outer
      scope. Date.now/Math.random → "nondeterministic", not rejected
- [ ] runtime backstop: one sandbox run with throwing stubs catches what
      static analysis misses
- [ ] UI classes: runnable / runnable-but-nondeterministic / not-runnable
Done when: classifier is honest — zero functions falsely promised as runnable.
You learn: **program analysis for effects**, why purity matters.

#### 2.3 Mutation + differential harness
- [ ] 5 high-signal mutators (PIT/Stryker research): conditional boundary
      (< → <=), negate conditional (=== → !==), arithmetic (+ → -),
      boolean/return flip, logical operator (&& → ||) — applied as string
      splices on tree-sitter spans, no extra parser
- [ ] input generation: curated edge corpus (0, -1, NaN, "", [], null,
      undefined, MAX_SAFE_INTEGER) + fast-check property runs with shrinking
- [ ] differential run: original vs mutant on same inputs → minimal breaking
      example ("changing < to <= breaks slugify(0)") or "survived"
Done when: pick a function in kisalafinuzunu, see a true breaking input.
You learn: **mutation testing**, **property-based testing + shrinking** —
the two testing ideas that separate seniors from juniors.

#### 2.4 Static blast radius
- [ ] transitive callers from the resolved graph: "you change this → these
      N functions in M files are affected", confidence-weighted
- [ ] impact view: ripple visualization on the map (glyph pulse along edges)
Done when: blast radius of a popular util function renders correctly.
You learn: **graph traversal in anger**, impact analysis.

#### 2.5 "What if" screen (ties 2.1-2.4 together)
- [ ] pick a function → see mutants → predict what breaks (that's the quiz
      moment) → run → watch the real answer with minimal counterexample
- [ ] "follow one action" flow view: statically derived 5-10 step story of
      one user action (route → handler → db), LLM-narrated
Done when: the predict-then-watch loop feels like the product's signature move.
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
