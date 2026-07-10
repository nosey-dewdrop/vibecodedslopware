# vibecodedflopware

LeetCode, but every question is generated from YOUR own codebase. For vibecoders
who shipped an app they cannot edit by hand. You connect a repo, the app maps it,
quizzes you on your own code (reading, fill-the-blank, bug injection, architecture),
and tracks mastery per module until you actually own what you shipped.

## Hard rules (Damla's decisions — do not revisit)

1. **User code is NEVER stored server-side.** Not in a DB, not in logs, not in
   backups. "Snapchat, but for tech" is the product identity AND the marketing hook.
2. **No monetization for now.** Deliberately deferred. Do not add pricing,
   paywalls, or upsells until Damla says so.
3. Name is `vibecodedflopware` (not slopware).

## Status

- 2026-07-09: Landing page built (cream paper + monospace + pastel confetti field
  + cursor-trail confetti + demo bug-injection quiz). Repo created, GitHub Pages live.
- Next up: Phase 1 (analyzer core) — see roadmap below. Nothing of the app itself
  exists yet.

## Design language

- Theme (Damla 2026-07-10): WHITE TERMINAL (light, default) + BLACK TERMINAL
  (dark mode), toggle in header, choice persisted. CREAM IS BANNED — Damla hates
  cream. The hogwild.uk screenshot was ONLY a confetti-behavior reference, never
  a color reference.
- NO COLORED WORDS in headings or copy (Damla: "generik bir hareket") — no pink
  "learn it", no colored word in the wordmark, no wavy underlines or colored
  decorations attached to titles. Text is ink-colored, period. Color lives ONLY
  in confetti, tiny list glyphs, links, and feedback states (correct/wrong).
- Corners sharp: border-radius 2px everywhere (global rule: 0-3px max).
- Fonts: Martian Mono (display/headings, 700–800) + IBM Plex Mono (body).
  All-lowercase copy. Never generic AI aesthetics, never purple-gradient-on-white.
- Confetti palette (approved): purple `#5a4a9f`, lavender `#b5a3ec`,
  pink `#f77fae`, yellow `#e0af2e`, green `#7fbf85`.
- APP DESIGN REFERENCE (Damla 2026-07-10: "portfolyomdan ilham al, o muhteşem"):
  damlahelloworld.github.io whimsy terminal — AoC vibe, mono, star field,
  ASCII flavor, warm pastels on deep plum. Its tokens: dark bg `#171221` /
  soft `#1f1930`, ink `#efe8f7`, pink `#ff8fb3`, purple `#c9a6ff`,
  green `#b8e39a`, yellow `#ffd479`, blue `#8fc7ff` (light variant exists in
  its index.html:24). For app screens (1.2+): keep our white/black terminal
  rule but borrow the portfolio's soul — log-line typing, glyph fields,
  ASCII details, pastel accents on glyphs only (colored-word ban still holds).
- Confetti is the signature: background field everywhere, cursor trail on hover
  over `[data-confetti]` elements, bursts on clicks/correct answers. Keep it in
  the app screens too, not just the landing.
- Damla's density rule (2026-07-09): audience is coders — small type (13px body),
  tight line-height, minimal vertical whitespace, side-by-side columns on
  desktop, show a lot fast. Never single narrow column with giant gaps.
- Respect `prefers-reduced-motion` in every animation we ever add.

## Architecture (privacy-first, decided with Damla)

Everything runs client-side; server is dumb and code-blind.

```
[user's browser]
  ├─ GitHub OAuth (PKCE) — token stays in browser storage only
  ├─ repo fetch — browser pulls tarball straight from GitHub API
  ├─ tree-sitter WASM — parses code, builds structure map (files/classes/
  │    functions/call graph) fully on-device
  ├─ IndexedDB — generated question bank + repo map live on the device
  └─ quiz UI + mastery engine

[our edge function]  (the ONLY server piece that ever sees code)
  └─ stateless LLM proxy: receives selected snippets, forwards to Anthropic API,
     returns generated questions. No persistence, no logging of bodies.
     Code exists "in transit" only, never "at rest".

[shared damlahelloworld Supabase]  (never sees code)
  └─ auth + numeric progress only: mastery %, streak, counts, hashed repo id
```

Known trade-off (accepted): question bank is per-device. New device → questions
regenerate; progress numbers survive (they live in Supabase).

## Tech stack (exact)

- **Landing (current)**: static HTML/CSS/JS, GitHub Pages, no build step.
  Files: `index.html`, `style.css`, `script.js`.
- **App (Phase 1+)**: Vite + TypeScript + Preact (small bundle, JSX familiarity).
  The app is a static SPA — also hostable on GitHub Pages; no server rendering needed.
- **Parsing**: `web-tree-sitter` (WASM). Grammars shipped as `.wasm` files, loaded
  lazily per detected language. Launch languages: JavaScript/TypeScript
  (`tree-sitter-javascript`, `tree-sitter-typescript`), Python (`tree-sitter-python`),
  Swift (`tree-sitter-swift`) — covers Damla's own repos for dogfooding.
- **Repo fetch**: GitHub REST API `GET /repos/{owner}/{repo}/tarball` from the
  browser; decompress with `fflate` (gunzip) + minimal tar reader. Public repos
  work with no auth; private repos need OAuth.
- **GitHub auth**: OAuth app with PKCE flow (no client secret in frontend).
  Scope: `repo` read. Token in `sessionStorage` (dies with the tab — most
  Snapchat-consistent choice).
- **Local storage**: `Dexie.js` over IndexedDB. Tables: `repos` (map + metadata),
  `questions`, `attempts`.
- **LLM proxy**: Supabase Edge Function (Deno) in the shared damlahelloworld
  Supabase project. Forwards to Anthropic Messages API, streams back. Model:
  latest Claude Sonnet tier (quality/cost balance for batch generation). MUST NOT
  log request bodies. Rate-limit per user (by Supabase JWT) to protect the API key.
- **Accounts/progress**: shared damlahelloworld Supabase (per ecosystem decision,
  report 2026-07-09). RLS on from day one, e2e-tested like Sıra Sende.
- **No frameworks beyond this.** No Tailwind (hand CSS is the house style),
  no state libraries until pain is real.

## Roadmap

DETAILED stage-by-stage plan with acceptance criteria and learning outcomes
lives in PROJECT.md (single source for detail). Summary below.

### Phase 0 — landing (DONE 2026-07-09)
- [x] landing page: hero, problem, how it works, demo quiz, privacy, outro
- [x] confetti field + cursor trail + bursts, reduced-motion support
- [x] repo + GitHub Pages

### Phase 1 — analyzer core (client-side repo map)
Goal: paste a public repo URL → see your codebase as a map. No LLM, no accounts.
- [ ] Vite + TS + Preact scaffold in `app/` (landing stays at repo root)
- [ ] fetch public repo tarball in browser, decompress (fflate + tar reader)
- [ ] file tree filter: skip binaries, `node_modules`, lockfiles, >200KB files
- [ ] language detection by extension; load matching tree-sitter grammar lazily
- [ ] extract per file: imports, classes, functions (name, params, line range),
      call sites → build module graph (group by directory as v1 heuristic)
- [ ] map screen: modules as cards, functions listed inside, "who calls whom"
      as simple arrows or a list (no fancy graph lib yet)
- [ ] store map in Dexie; reopening the app shows cached map instantly
- [ ] edge cases: empty repo, single-file repo, unsupported language (graceful
      "we don't speak this yet"), rate-limited GitHub API (show remaining quota)

### Phase 2 — question engine
Goal: the map becomes a question bank, generated in one batch at analysis time.
- [ ] Supabase Edge Function `generate-questions`: input = snippet + question
      type + context (function signature, module name); output = JSON question
- [ ] prompt design per question type (see specs below); force JSON schema output
- [ ] batch pipeline in browser: pick candidate functions (scoring: is it called
      often? is it long enough? does it have logic, not just config?), send
      top N per module, store results in Dexie
- [ ] bug injection generated deterministically where possible (mutate operator,
      swap argument order, off-by-one) so LLM cost stays low — LLM only writes
      the explanation
- [ ] question quality gate: validate JSON, reject questions referencing code
      that is not in the snippet, dedupe
- [ ] cost guard: cap questions per repo per day; queue with progress UI
      ("generating your curriculum… 34/120")

### Phase 3 — quiz experience + mastery
Goal: the LeetCode feeling, but warm and confetti-filled.
- [ ] quiz screen: one question at a time, keyboard-first (1/2/3 to answer,
      enter for next), instant feedback, confetti burst on correct
- [ ] mastery model per module: `mastery = correct_unique / total_questions`,
      weighted by question difficulty; wrong answers requeue with spaced
      repetition (reuse the SRS interval logic pattern from Miss Ducky)
- [ ] streak (daily), XP, per-repo dashboard: "kisalafinuzunu — 40% owned"
- [ ] empty states, session summary screen, full CRUD (delete repo wipes
      EVERYTHING local including questions — prove the Snapchat promise)

### Phase 4 — accounts + progress sync
Goal: numbers survive devices; code still never leaves them.
- [ ] Supabase auth (shared project, same pattern as Sıra Sende: RLS + e2e test)
- [ ] tables: `profiles`, `repo_progress` (user_id, repo_hash sha256 of
      "owner/repo", module_hash, mastery, question_count, updated_at),
      `streaks` — NO code, NO filenames, NO repo names (hashes only)
- [ ] private repo support via OAuth PKCE
- [ ] privacy policy page ships in the SAME session auth ships (KVKK/GDPR;
      the zero-storage claim must match reality exactly, it is a legal claim)

### Phase 5 — polish + public launch
- [ ] full ship-check (~/.claude/docs/ship-check.md): edge cases, empty states,
      onboarding, accessibility, EN copy pass, performance (WASM lazy-load,
      bundle size), the Five Doors
- [ ] onboarding: first-run tour that analyzes a tiny demo repo so the user
      sees the magic in 30 seconds without connecting anything
- [ ] share card: "i own 73% of my codebase" (numbers only — safe to share)

## Question type specs (v1)

1. **code reading** — show a real function, ask output for a concrete input.
   MCQ, 3 options, distractors must be plausible (LLM generates them from the
   actual code paths).
2. **fill the blank** — one real line with one token/expression removed. MCQ v1
   (free text later, needs normalization).
3. **bug injection** — mutate one line (operator flip, wrong var, swapped args,
   off-by-one). Show the mutated snippet, "which line is broken?" then "what
   should it be?"
4. **architecture** — "you need to add X, which file/module do you touch first?"
   Generated from the module graph, not from the LLM's imagination — options are
   real module names.

## Decisions log

- 2026-07-09: name = vibecodedflopware; no money for now; zero code storage is
  non-negotiable; all analysis client-side (tree-sitter WASM); questions on
  device (IndexedDB); server keeps numbers only. Landing before app.

## Ideas parking (not scheduled, do not build)

- LEADERBOARD (Damla 2026-07-10, wants this): real ranking across users,
  useful for HIRING ("this person owns 90% of their codebase" as a signal
  employers trust). Needs anti-cheat thinking before building.
- community angle (Damla 2026-07-10): "vibecoderlari birlestirmemiz lazim" —
  unite vibecoders, social layer around the product.
- free-text answers with fuzzy matching
- multiplayer: quiz a friend on THEIR repo
- "explain this function in your own words" graded by LLM
- editor plugin that quizzes you on files you just vibecoded
- CI badge: "owner understands 80% of this repo"
