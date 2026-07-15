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
- [ ] shared nosey-dewdrop Supabase: auth, RLS on from day one, e2e-tested
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

## SLOP-KURTARMA HAMLELERİ (2026-07-15)

Honest diagnosis of why it still reads as "just a tool / landing", and 5
low-effort/high-impact moves to make it feel viral and alive. Nothing here
breaks the frozen UI law, the zero-code-storage rule, or the no-money rule.
Each move produces a SHAREABLE, NUMBERS-ONLY artifact — never leaks code.

### Honest diagnosis — why it feels slop right now
1. A stranger lands with no repo in hand, or is scared to paste one, and the
   very first magic (the analyzer) demands input + trust before giving anything.
   There is no zero-friction "wow" for someone who just wants to look.
2. The analyzer is genuinely good, but it ends in a private explorer screen.
   Nothing leaves the tab. No screenshot, no number, no bragging right — so
   nobody has a reason to post it. A tool nobody shares looks dead even if it
   is excellent.
3. The name "vibecodedflopware" is the single strongest asset and it is buried.
   The self-roast ("my slop-catcher was itself slop") is the exact tone that
   travels on dev-Twitter (see roast-my-code, "vibe coding without code
   knowledge" as a named 2026 anxiety). The product currently under-uses its
   own joke.
4. The Phase 3 quiz — the actual verb of the product ("get quizzed") — isn't
   built yet, so today the app can only DESCRIBE your code, not TEST you on it.
   That gap is fine to defer, but it means the viral hook cannot depend on the
   quiz; it must live in the analyzer output we already have.

### The moves (low effort, high impact)

**M1 — the ownership score + share card (THE headline move).**
- What: after any analysis, compute one honest number from data we already
  have — e.g. `resolved calls / total calls` from the existing confidence bar,
  reframed as "you can explain __% of your own repo" — and render a share card
  (repo name optional/toggle-off, otherwise just the number + verdict line like
  "certified vibecoder" / "you actually own this"). Download-as-PNG + copy-link.
- Why: this is the GitHub-Wrapped / roast-my-code pattern — dry stats become a
  personal, postable badge. It converts the analyzer's private ending into a
  public artifact, giving the first real reason to share. The self-ironic verdict
  copy carries the flopware joke outward.
- Difficulty: **M** (card is HTML→canvas; the number already exists in the
  confidence bar; no backend).
- Moderation/generation: none — deterministic from the local graph, no LLM.
- Privacy: numbers only; repo name is opt-IN and defaults off; nothing rendered
  from source lines. Fully consistent with the zero-storage promise.

**M2 — the 15-second demo repo (kill the empty first screen).**
- What: a "roast a sample repo" / "see it on someone's flopware" button on the
  landing + app home that instantly analyzes a tiny bundled demo repo (Damla's
  own — dogfood the joke) with no paste, no auth. The magic plays in 15s before
  any trust is asked.
- Why: removes the cold-start wall (diagnosis #1). Research on shareable tools:
  the wow must arrive before the ask. Also lets first-timers reach M1's share
  card without owning a repo — widening who can post.
- Difficulty: **S** (Phase 6 already lists a demo-repo onboarding; pull it
  forward as a one-click entry, reuse existing analyzer).
- Moderation/generation: none.
- Privacy: demo repo is public + ours; nothing about the user touched.

**M3 — "which line breaks if I delete this?" as a standalone shareable dare.**
- What: the Phase 2 blast-radius / break-it-on-purpose experiment already runs
  in-browser. Surface ONE punchy result as a shareable moment: "changing `>=`
  to `>` breaks `isAdult(18)` — and your tests wouldn't catch it." Card + the
  same download/copy affordance as M1.
- Why: this is the product's most visceral, most true fear ("what if I touch
  this line") turned into content. It shows the engine's depth (not just a map)
  and it is inherently a "bet you can't guess" hook — high replay/quote value.
- Difficulty: **S** (the experiment exists in `whatif-panel.tsx`; only the
  card packaging is new).
- Moderation/generation: none — sandbox-verified, deterministic.
- Privacy: the snippet stays on-device; the SHARE card shows only the verdict
  sentence with the function name, no full source. (If even the function name
  feels sensitive, offer a "blur names" toggle.)

**M4 — lean the whole entry into the flopware confession (copy-only).**
- What: a small, honest "why this exists" strip near the top / in the share
  verdicts using the real origin: "i built a slop-catcher. it was slop. so i
  rebuilt it to catch mine first." Weaponize the name instead of hiding it.
- Why: the confession tone is the exact register that spreads among devs right
  now, and it is TRUE (see devlog reels 1, 11, 13). It costs nothing and makes
  the product feel human, not another AI-slop dev tool — which is the whole
  differentiator.
- Difficulty: **S** (copy only; touches wording, not the frozen layout — get
  Damla's ok on exact lines since landing visuals are frozen).
- Moderation/generation: none.
- Privacy: n/a.

**M5 — "quiz a friend on THEIR repo" as a link, not a feature (deferred-safe).**
- What: once the quiz exists (Phase 3+), a challenge link: paste your friend's
  public repo → send them a link that opens straight into a quiz on it →
  results show a number only. For NOW, ship the lightweight version: a "dare a
  friend" share text that links them to M2/M3 on a repo you pick.
- Why: turns a solo tool into a two-player loop — the single biggest multiplier
  for reach (every share recruits a second player). Matches Damla's own parked
  "multiplayer / unite vibecoders" idea.
- Difficulty: **M now (link + prefill), L for the full quiz version**.
- Moderation/generation: none now; quiz version reuses Phase 3 generation.
- Privacy: only a public repo id travels in the link; no code, no accounts
  needed for the light version.

### Sequencing (cheapest first)
M4 (copy) → M2 (one-click demo) → M1 (share card off existing number) →
M3 (blast-radius card) → M5 light. M1+M2+M4 together already flip the app from
"private tool" to "postable moment" with no new engine work.
