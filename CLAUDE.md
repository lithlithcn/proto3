# CLAUDE.md — working in Proto4

Owner: Houcine (HKN), French-speaking: reply in French, code/docs in English. Minimise token usage. No AI-generated assets (code only). No religious content or pentagrams. Mobile must stay fully usable by touch. Effects OFF must stay epilepsy-safe. Do not attach files already pushed to GitHub. Never enter or repeat secrets (the TURN token lives only in the Cloudflare Worker secret, `workers/`).

## What Proto4 is
The original game's code (frozen copy: `legacy/shmup-fighter.html`), copied verbatim and organized in files by theme. Proto3 (a full rewrite) is archived on branch `proto3-archive`: it was too costly to finish (DESIGN lesson: never again translate working code into another data model).

## Working rules (owner's, non-negotiable)
- The goal is the GAME. Keep what works; change only what the task needs. No rewrite "for cleanliness".
- Clean an area (split a big file, untangle its wrappers, add JSDoc types) only while working on it for a real feature or bug.
- No new tool unless it clearly saves more time than it costs. Reuse `tools/`.
- Validate what matters, not more: `node tools/regress.cjs` for gameplay, `node tools/smoke.cjs` when UI/loading changed. No pixel hunts.
- Log every task in `docs/velocity.md` (one line: what, time spent, result) so speed is measured.

## Decision principle (owner's permanent rule)
Proto4 exists so Claude develops the GAME as efficiently as possible, now and for years. Tools, architecture, tests and docs are never goals.
Before any tool/abstraction/doc system answer: which concrete problem, how often, what it costs today, how much it saves, its build + maintenance cost, is there something much simpler? Hypothetical or unmeasurable benefit → don't build it. Never spend more time on tooling around a feature than on the feature. Never claim a speed-up without evidence (velocity.md). Content must become addable by dropping a folder (bosses, story mode, mini-games): that is the engine goal.

## Reflexes learned from Proto3 ("proto3guide": what made it cost a week of credits for 2 %)
- Never translate working code into another data model. Reuse the code as it is.
- Before editing a function, `node tools/map.cjs <name>`: the wrapper chain is where behaviour hides (most Proto3 rework came from missed wrappers).
- Inserting code into a legacy line: never a `//` comment (it swallows the rest of the line; happened twice), use `/* */`.
- Legacy lines are huge: never cat a whole file; grep + `cut -c` / map. Read only what the task needs.
- Gameplay identity is checked by `npm test`; no pixel/sound exactness hunts.
- Validate once per batch of changes, not after every edit. A task unexpectedly past ~1 h: stop, write down why, reassess.
- Context gets summarised: write durable findings at once (one line in the right doc), so they are not re-discovered.

## How the code runs (read once)
- `index.html` loads `src/**/*.js` as plain scripts, in its listed order (the order = the original file's order). All files share one global scope.
- In the original single script every function existed from the start. Split files load one after another, so load-time statements are queued with `DEFER(()=>{...})` and run in the original order by `src/core/boot.js` after every file is loaded. New load-time code: wrap it in `DEFER` too (functions and plain-literal constants don't need it).
- Many functions are REPLACED by later files: `{const S0=step;step=()=>{...;S0()}}` (step 31×, render 19×, ...). Before changing a function run `node tools/map.cjs <name>`: it lists the base definition and every wrapper in order (the last one runs first).
- Characters: `src/characters/<name>.js` (one kit each, pushed into `CHR7`; Reimu = base kit in combat/joueurs + characters/reimu-yinyang). Items: by legacy batch in `src/items/`. Find any word: `node tools/map.cjs <word>` / grep.
- New content = a folder `content/<name>/*.js` + `node tools/content.cjs` (adds its scripts to index.html, after the game and `src/engine/`). A mini-game / boss fight / story chapter: `defMode({...})` (contract at the top of `src/engine/modes.js`: 60 Hz step, render, nav events, `modeInput(slot)` for keyboard/pad/phone, hub tile EXTRAS). Content runs after boot: no DEFER needed. `npm run smoke` opens every declared mode automatically.
- Where is what: `PROJECT_MAP.md` (regenerate with `node tools/map.cjs` after adding/renaming files).

## Commands
`npm run dev` (http://localhost:8080, edit + reload, no build) · `npm test` = `node tools/regress.cjs` (8 CPU matches headless vs `tests/baseline.json`; `--update` after an INTENDED gameplay change, and say in the commit what changed) · `npm run smoke` (browser: loads, runs a match, no JS error; needs Playwright) · `npm run map [name]`.
`tools/headless.cjs` runs the game without rendering (for tests, bug repro, mass simulations).
Bug hunting: `node tools/campaign.cjs [N] [--kind mix|cpu|rollback|online]` (N headless games on all cores: crash, NaN, flood, rollback save/load/replay mismatch, online desync through the real netcode; unique issues in reports/campaign.json) · `--repro <report.json>` replays the job of a report (the owner's DEBUG LAB files too) · `--selftest` injects each bug kind and must catch all (in CI) · `node tools/diverge.cjs [match] [ref]` = first frame + exact values that differ between a git version and the working tree (use it when `npm test` says CHANGED).
Online UI without internet: `tools/online-sim.cjs` (`openRoom(n)`: n browser tabs joined through a fake PeerJS on BroadcastChannel; real lobby/netcode code) — use it for every online change.
Owner's DEBUG LAB = the same checks in the browser (type `ewekeks` on the title screen; content/debug-lab/): he runs it for hours and sends the JSON files (one per NEW issue signature). Start a fix with `--repro` on his file.

## After every push
Check CI (`gh run list --limit 1`). The published site is the `_site` copy made in `.github/workflows/ci.yml`: a new top-level folder must be added to its `cp` line (CI fails if index.html loads a missing file). A red CI e-mails the owner; never leave main red.

## Knowledge from Proto3
`docs/proto3-notes/`: mechanic/character/item sheets (rules + legacy line refs; their "port files" paths are in branch proto3-archive) and `bugs.md` (real legacy bugs found during the rewrite; not yet applied here).
