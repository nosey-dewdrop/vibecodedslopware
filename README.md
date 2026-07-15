# vibecodedflopware 🐣

*leetcode, but every question comes from your own code.*

live: https://nosey-dewdrop.github.io/vibecodedflopware/

## why i built it ❤️

most of us have shipped an app we can no longer edit by hand. we vibecoded it, it worked, but we do not really know what is going on inside. vibecodedflopware turns your own repo into a practice ground: it maps your codebase and quizzes you on your own code (reading, fill the blank, bug injection, architecture) until you actually own the thing you shipped.

the identity and the marketing hook are one promise: **"snapchat, but for tech"**. your code is never stored. not on a server, not in a log, not in a backup. it exists in transit, never at rest.

## not there yet, but it will be 🚧

honestly, the product is not finished. what actually works today: you paste a public repo url, the browser pulls it straight from github (never touching our servers), tree-sitter parses the code inside a worker, and you get a code map with modules, symbol details and a mini neighborhood graph. so the "see your own code as a map" part is standing.

the real missing piece: the map becoming a question bank, the quiz experience, mastery tracking and accounts. the vision is an "understanding engine" that does not just draw the map but answers "what happens if i change this method?" by actually mutating and running it in an in-browser sandbox, then questions generated from answers that engine has verified.

## question types (v1 plan)

1. **code reading**. show a real function, ask for the output on a concrete input. distractors are generated from real code paths.
2. **fill the blank**. one token/expression removed from a real line.
3. **bug injection**. one line gets mutated (operator flip, wrong variable, swapped arguments, off-by-one). "which line is broken?" then "what should it be?"
4. **architecture**. "you need to add x, which file do you touch first?" the options come from the real module graph, not from an llm's imagination.

## hard rules (decisions, not up for revisiting) 🔒

1. user code is **never** stored server-side. no db, no logs, no backups, nowhere.
2. no money model for now. deliberately deferred.
3. the name is `vibecodedflopware` (not slopware).

## architecture (privacy-first)

everything runs client-side. the server is dumb and blind.

```
[user's browser]
  ├─ github oauth (pkce), token lives only in browser storage
  ├─ repo fetch, tarball straight from the github api
  ├─ tree-sitter wasm, parses the code and builds the structure map on-device
  ├─ indexeddb, generated question bank plus repo map stay on the device
  └─ quiz ui plus mastery engine

[edge function]  (the ONLY server piece that ever sees code)
  └─ stateless llm proxy: takes selected snippets, forwards them to the
     anthropic api, returns the generated questions. no persistence,
     no body logging.

[shared damlahelloworld supabase]  (never sees code)
  └─ auth plus numeric progress only: mastery %, streak, counts, hashed repo id
```

accepted trade-off: the question bank is per-device. new device → questions regenerate; progress numbers survive (they live in supabase).

## stack

- **landing (current)**: static html/css/js, github pages, no build step.
- **app**: vite plus typescript plus preact (small bundle), static spa.
- **parsing**: web-tree-sitter (wasm), grammars lazy-loaded per language. launch languages: javascript/typescript, python, swift (for dogfooding on my own repos).
- **repo fetch**: github rest api tarball in the browser, unpacked with fflate (gunzip) plus a minimal tar reader.
- **github auth**: oauth with pkce (no client secret in the frontend), token in `sessionStorage` (dies with the tab, the most snapchat-consistent choice).
- **local storage**: dexie.js over indexeddb.
- **llm proxy**: edge function (deno) on the shared supabase, forwarding to the anthropic messages api. no body logging, per-user rate limits.
- no tailwind, no state library. hand-written css is the house style.

## where it is going

the landing is live, the phase 1 analyzer (repo map) works. next: persistence (dexie) → understanding engine (sandbox plus mutation) → question engine → quiz plus mastery → accounts. the stage-by-stage plan and acceptance criteria are in `PROJECT.md`.
