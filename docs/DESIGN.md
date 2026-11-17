# Proto3 — Design Guideline

Status: design approved in discussion (2026-11-14). No code yet. This file moves to the Proto3 repo as `docs/DESIGN.md` on day 1.
Every rule below exists because of a concrete failure mode. When code disagrees with this document, either the code is wrong or this document must be updated in the same commit (with an ADR if the decision changes).

---

## 0. Goals and non-goals

Goals, in priority order:
1. **Same game.** Proto3 plays and looks like the current `shmup-fighter.html` (balance values identical; only invisible float decimals may differ).
2. **Sandbox engine.** Everything except a tiny kernel is a *pack*. The base game is a set of packs in the exact format mods use. Anything can be added, replaced or removed without touching unrelated code.
3. **AI-editable.** Any request maps to a small, predictable set of files. One file answers one question.
4. **Debuggable by construction.** Every bug is reproducible from a replay; every desync names the field that diverged.
5. **Online-safe.** Deterministic simulation, rollback netcode, 2–32 players.
6. **One link, no install.** Static site on GitHub Pages.

Non-goals (for now): mod editor UI, auto-translation, leaderboard server, mod sandboxing. Formats must not prevent them later.

### 0.1 How to use this document
Read §0–§2 and §21 before any task. §25 is the risk register: every new failure mode found during work is added there with its mitigation. When the repo exists, this file is split into `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/DEBUG.md`, `docs/TESTING.md`, `docs/MODDING.md` with this file kept as the index.

### 0.15 Build now vs later (anti over-engineering)
Formats and interfaces are fixed now; implementations arrive when needed.
- **Phase 2 (skeleton) builds:** kernel, schemas + generated snapshot/hash/diff, RNG streams, `sim.math`, pack loader for built-in packs, events/hooks with phases, commands, world config, replays, headless runner, `pnpm check`, scaffolding, CI, docs skeleton.
- **Built when the port reaches it:** each combat system, render, UI, online, audio, YouTube, i18n FR, quality tiers, interpolation, lab UI.
- **After parity:** mod folder loader, in-browser TS transpiler, mod API compatibility suite, spectators, replay sharing, new modes.
Anything not listed must justify itself in an ADR before being built.

### 0.2 Requirements traceability (owner's requirements → where they are satisfied)
| # | Requirement (from the Proto3 brief and the design discussion) | Sections |
|---|---|---|
| Q1 | Full rewrite, not a reorganisation; nothing removed; same game, same look | §0, §17, §14 (parity), §20.12 |
| Q2 | Architecture built for AI editing: clear responsibilities, explicit dependencies, no hidden globals, predictable names, no duplication, centralised config | §2, §4.2, §15, §20.1–20.3 |
| Q3 | Smart modularity: one concept per file, character moves in separate files (Rivals workshop style), not hundreds of trivial files | §15 |
| Q4 | Everything is a pack/mod reading each other; sandbox engine with total freedom | §2, §11, §18 |
| Q5 | Whole features (bosses, adventure, classic, minigames) by adding a folder | §18, §21 |
| Q6 | Exceptional debug: per system, calls, values, states, events, interactions, config changes, perf; levels and categories; near-zero cost when off | §12 |
| Q7 | Modifications isolated; contracts between systems; no circular deps; testable in isolation | §2.1, §5, §14, §19 |
| Q8 | Tests: unit, integration, regression, data validation, workers, broken dependencies, comparison with the old game | §14, §19 |
| Q9 | Documentation made for Claude, kept in sync (PROJECT_MAP, guides) | §16 |
| Q10 | Performance and memory optimised but measurable, never at the cost of readability | §9, §14 (benchmarks), §20.6 |
| Q11 | Phased method (audit → design → repo → rewrite → verification → finalisation), validated by the owner at each phase | §17, §24 |
| Q12 | One link, no install; any technology allowed if that holds; external dependencies identified | §1, §23 |
| Q13 | TypeScript, English code and docs, HTML/CSS menus, GitHub Pages, current PeerJS + TURN | §1 |
| Q14 | Translations (per-language text files, maybe auto-translate later) | §8.4 |
| Q15 | Mods: zip files in a `mods/` folder, characters/maps/items/…, JS or TS, Rivals-style hot reload key, extreme debug for modders | §11, §12, §20.13 |
| Q16 | Bug lab with dozens/hundreds of parallel matches, unlocked by typing `ewekeks` on the title screen | §13 |
| Q17 | Dev options off by default in Options; no separate dev site | §12, §20.3 |
| Q18 | No visual effect shown for a rolled-back prediction | §7 |
| Q19 | Mobile fully usable by touch only | §8.1, §14 |
| Q20 | Epilepsy safety (Effects OFF) | §7, §14 |
| Q21 | No AI-generated assets; no religious references or pentagrams | §20.7 |
| Q22 | Online 2–32 players, host features (music sharing, rules), spectators | §10, §18.8 |
| Q23 | Each future request is analysed for how it integrates with the environment; organising questions asked, feasibility questions not | §21 |

---

## 1. Stack (decided)

| Concern | Choice | Why / rejected |
|---|---|---|
| Language | TypeScript, `strict`, no `any` | Errors caught before running. Rust/WASM rejected: slower iteration, game is not CPU-bound. |
| Build | Vite | Static output, HMR in dev. |
| Menus | Svelte (pinned major) | One file per screen with markup+logic+CSS+transitions. React rejected (heavier), raw DOM rejected (mess at 15+ screens). |
| Fight rendering | Own WebGL2 renderer, Canvas2D fallback | Current game already batches bullets in WebGL. PixiJS only if a benchmark proves it faster (ADR required). |
| Tests | Vitest (headless sim), Playwright (UI, mobile, screenshots) | |
| Hosting | GitHub Pages, deploy by GitHub Actions only after all checks pass | Pages cannot set COOP/COEP headers → no SharedArrayBuffer → sim stays on main thread (see §9). |
| Online | Keep current PeerJS + WebRTC + Cloudflare TURN (`sf-turn` worker), host relay (star) | Works today. |
| Workers | `sf-turn` (TURN creds), `sort-maker` (YouTube playlist/search/thumb proxy) live in `workers/` | Deployment mode decided later. |
| Runtime deps | PeerJS, small TS transpiler for mods (lazy-loaded), small schema validator, small zip reader (lazy-loaded, mods) | Minimise deps: 10–20 year horizon. |

---

## 2. Kernel vs packs

### 2.1 Kernel (frozen, tiny, no gameplay)
- Fixed-step loop (60 Hz) + render interpolation hook.
- State container built from pack schemas (§4).
- Deterministic math (`sim.math`) and seeded RNG streams (§3).
- Snapshot / restore / hash / diff generated from schemas.
- Pack loader: manifest validation, dependency resolution, deterministic load order, overrides.
- Event bus + hook phases (§5).
- Input frame format and command format (§6).
- Entity handle allocator (§4.3).
- Error isolation (§5.5).

The kernel never imports a pack. Packs import only the kernel API (`@kernel`) and the public API of packs they declare as dependencies.

### 2.2 Packs (everything else)
```
packs/
  combat/        group of composable system packs (§18.2): movement, bullets, collision, health, statuses,
                 stocks-ko, parry, spells, items, camera-rules, spawning, cpu-ai
  touhou/        characters/, items/, maps/, rules/      (Touhou content)
  modes/         versus, training, playground, online-match, cpu-battle
  ui/            screens and menus (Svelte)
  hud/           in-fight HUD (drawn by render, not Svelte — §8.3)
  render/        fight renderer, effects, camera
  audio/         sfx, music, special tracks priority
  input/         keyboard, gamepad, touch, mouse-buttons, bindings
  online/        transport, lobby, relay, rollback driver, spectators
  youtube/       playlist player, video background
  lab/           bug lab (secret code "ewekeks" on title screen)
  dev-tools/     inspector, logs, overlays (disabled by default in Options)
  i18n/          string tables (en, fr), language switch
  std/           shared library: vectors, shapes, collisions, grids, tilemaps, pathfinding, easing, noise
  minigames/<id>/  bosses/<id>/  (any new feature = a new folder, see §18)
```

### 2.3 Pack manifest (`pack.ts`)
```ts
export default definePack({
  id: 'touhou',                 // namespace; all ids inside are 'touhou:<name>'
  version: '1.0.0',
  requires: ['core-combat@^1'], // semver ranges
  provides: ['characters', 'items', 'maps'],   // named public APIs / content it contributes
  overrides: [],                // explicit ids this pack replaces, e.g. 'touhou:reimu'
  state: touhouStateSchema,     // this pack's state slice (§4)
});
```
Packs live in one Vite app (TS path aliases `@pack/<id>`); boundaries are enforced by dependency-cruiser, not by separate npm packages.
Content files are discovered by folder convention (`import.meta.glob` for built-in packs, zip listing for mods). No hand-maintained registries.

### 2.4 Overrides and load order
- Ids are namespaced: `touhou:reimu`, `mymod:reimu`.
- Replacing content is explicit: `overrides: ['touhou:reimu']`. Silent collisions are a load error.
- A load-order list in Options decides conflicts. Same list + same pack hashes are required for online play (§10.2).

---

## 3. Determinism rules (the online contract)

1. Sim code uses only `+ - * / %`, comparisons, `Math.sqrt`, `Math.floor/ceil/round/trunc/abs/min/max/sign`, and `sim.math` (`sin, cos, atan2, hypot, pow, exp, log, lerp, angle helpers`). `Math.sin/cos/tan/atan/atan2/hypot/pow/exp/log/cbrt/random` are banned in `sim` and `packs/*/sim`. Enforced by lint.
2. No `Date`, `performance`, `setTimeout`, DOM, `localStorage`, or network in sim code. Enforced by import-boundary lint.
3. **RNG streams.** `rng.stream('touhou:items')` — each pack/system has its own seeded stream derived from match seed + stream id. Adding a random call in one mod never shifts another pack's randomness (keeps replays and parity stable).
4. **Sorting.** Only `sim.sort(arr, key)` which breaks ties by entity id. `Array.prototype.sort` banned in sim.
5. **Iteration order.** Iterate arrays or id-ordered collections. No iteration over object keys that may differ by insertion history.
6. **Floats.** Float64 everywhere in sim (`Float64Array` for typed storage). No Float32 in sim state.
7. **Runtime sanitizer** (dev, lab): during each sim step, `Math.random`, `Date.now`, `performance.now` and banned `Math.*` are trapped and throw with file/line. Catches mods, which lint cannot see.
8. **Input quantisation.** Analog values are int8 before entering the sim.
9. Everything that affects the sim is an **input** or a **command** at a frame (§6). Nothing else.
10. Also banned in sim: `localeCompare`, `Intl`, `toLocaleString`, `JSON.stringify` for hashing (hashing walks schemas in schema order), recursion without a depth bound (stack limits differ between browsers, so an overflow would not be deterministic).

---

## 4. State

### 4.1 Data only
State contains numbers, strings, booleans, arrays, typed arrays and plain objects. Never functions, class instances, DOM nodes or closures. Behaviour is referenced by id (`{ item: 'touhou:black-hole', t0: 900, params }`). This makes snapshots, hashing, replays, spectator joins, and hot reload work.

### 4.2 Schemas
Each pack declares its state slice with a schema (field types, defaults, sizes). The kernel generates from schemas:
- preallocated snapshot slots and copy functions (no per-frame allocation),
- hash function (whole state, per-section hashes),
- field-level diff (desync reports),
- inspector UI (dev-tools),
- validation (dev asserts, loaded saves).
Slices are namespaced: `state.packs['touhou']`. A pack may only write its own slice; reading another pack's slice goes through that pack's public API.

### 4.3 Entities
- Handles = index + generation. A stale handle (entity died, slot reused) is detected, never confused with the new entity.
- Kinds stay separate: players (≤32, objects), bullets (thousands, struct-of-arrays typed storage behind a small API: `spawn`, `kill`, `forEach`, `query(area)`), world entities (hundreds, objects).
- Spatial uniform grid for collision queries, rebuilt per frame from typed arrays.
- Hard cap `MAX_BULLETS` enforced in the single `spawn` function (old bug: `spawnH` bypassed the cap). Cap policy is explicit and tested (heavy shots replace the oldest light bullet).

### 4.4 Statuses and stat pipeline
All rule-changing effects are statuses in state: `{ id, owner, source, t0, duration, stacks, params }`. Derived values are computed: `stat(player, 'damageOut')` = base × all active modifiers, in a deterministic order. Items, spells, rules and mods add statuses; they never sprinkle `if (flag)` checks through other systems.

### 4.5 Special cases that must be designed for (from the old game)
- **History Rewritten** (restores past state) → kernel service `history` storing compact snapshots *inside* state (schema type `blob`), so rollback stays correct. A history blob never contains the history slice itself (no nested snapshots), and its size is capped.
- **Body Swap / control remap** → sim-level controller indirection table (`controllerOf[player]`) in state.
- **View-affecting items** (darkness, fog, inverted colours, camera swap) → sim exposes *view modifiers* in state; render reads them. Render never decides gameplay.
- **Time stop, slow motion, x2 speed** → kernel time-scale owned by the sim (frames still advance deterministically).
- **Echoes/clones repeating attacks** (Four of a Kind) → scheduled actions queue in state.

---

## 5. Events and hooks

### 5.1 Events
Typed events emitted by sim systems: `hit`, `parry`, `ko`, `spell:start`, `item:pickup`, `bullet:spawn`, `frame`, ... Each event type is declared in one file with its payload schema and documentation (catalog generated).

### 5.2 Phases instead of priorities
Hooks attach to named phases (`damage:before`, `damage:apply`, `damage:after`) with optional `after: ['core-combat:parry']`. Ties are broken by pack id. Numeric priorities are banned (they degenerate into priority wars).

### 5.3 Mutation contract
`*:before` hooks may modify declared fields of the event (e.g. damage multiplier) or cancel it. `*:after` hooks are read-only for that event. Contract per event documented in its file.

### 5.4 Re-entrancy
Events emitted inside hooks are queued and processed in deterministic FIFO order with a max chain depth. Exceeding it is an error naming the hook chain.

### 5.5 Error isolation
An exception in a hook disables that hook from that frame on, records a report, and the match continues. Same code + same state ⇒ every client disables it at the same frame ⇒ no desync.

### 5.6 Hot paths
No per-bullet-per-frame dynamic hook dispatch. Systems iterate typed arrays directly. Packs act on events, or replace a whole system (allowed via override).

---

## 6. Input and commands
- `InputFrame` per player per frame: buttons bitmask + quantised analog.
- `Command` = `{ frame, type, payload }` for anything else that changes the sim (host rule change mid-match, pause in offline, debug spawns in training). Commands travel in the net stream and are stored in replays.
- Devices (keyboard, pads, touch, mouse buttons) live in `packs/input` and produce InputFrames. Bindings are UI/settings, never sim.
- Online input delay is configurable; prediction repeats last input.

---

## 7. Presentation: FX, audio, interpolation
- Sim emits events; render and audio derive particles, flashes, shakes, sounds from them. FX are not in sim state → lighter rollback, trivial *Effects OFF*.
- **Rollback cancel:** each FX/sound is tagged with its source event key `(frame, eventId)`. After a resimulation, FX whose event no longer exists are removed immediately; long sounds stop. Short sounds already played cannot be undone (accepted).
- Duplicate events from resimulation are deduplicated by the same key.
- **Interpolation:** render draws between the last two sim states for 120/144 Hz screens. Must never be worse than the old game; can be disabled in Options.
- *Effects* setting: FULL / REDUCED / OFF (OFF removes shakes, flashes, zooms, inversions, particles; keeps gameplay-critical visuals). Epilepsy safety is a requirement, tested by Playwright.
- Special music (results, last stock) has priority over the YouTube player (pause video, resume after).

---

## 8. UI
### 8.1 Screens
One folder per screen in `packs/ui/screens/<screen>/` (screen component + panels as separate files + its strings). Navigation is a small router with a stack; every screen works with keyboard, gamepad, mouse and **touch only** (tested).
### 8.15 Screen interface (framework-agnostic)
The router only knows `Screen = { id, mount(el, ctx) → { destroy, onAction? } }`. Built-in screens are Svelte components compiled at build time behind this interface; mods (which cannot compile Svelte in the browser) implement the same interface with plain DOM or their own pre-built bundle. Replacing Svelte later only touches the `ui` pack.
### 8.2 Style
Reproduce the current look (skewed cards, italic heavy titles, glass sidebar, Limbus-like frames). Shared design tokens (colors, fonts, easing) in one file.
### 8.3 HUD
In-fight HUD is drawn by `render`/`hud` (canvas/WebGL), not Svelte, to avoid DOM work and GC every frame.
### 8.4 Text
No user-visible string in code. All text via `t('pack:key')`, string tables per pack per language (`en.json`, `fr.json`), Rivals-style. Auto-translation may be added later as a fallback for missing keys.

---

## 9. Threads and timing
- Sim on main thread (no SharedArrayBuffer on GitHub Pages).
- Hidden tab: rAF is throttled → a Web Worker clock keeps net ticks alive (as today).
- Budget: a rollback re-simulates several frames inside one display frame, so the **sim step budget is ≤ 1.5 ms** (4 players, heavy bullets, mid laptop) so that an 8-frame rollback fits in ~12 ms. With many players the netcode adapts: larger input delay and smaller prediction window, measured live. Budgets are checked by CI benchmarks and by the lab.
- Zero allocations per frame in sim hot paths (pools, preallocated snapshots).

---

## 10. Online
### 10.1 Netcode
Rollback with max prediction window (stall beyond it, as today), star topology with host relay, bundled messages, bandwidth guard, heartbeat drop. Spectators receive the input stream (not a video); mid-match join = full state snapshot (from schema serializer) + inputs.
### 10.2 Handshake
Protocol version + game version + content hash (all packs, mods, load order). Mismatch → refused with the exact differing pack named. Later: host can send mods.
### 10.3 Locks
Hot reload disabled during online matches. Content locked per match.
### 10.4 Desync
Periodic hash per section. On mismatch: exchange snapshot, field-level diff, report names system + field + frame; replay attached.
### 10.5 Scale
32 players: inputs bit-packed and run-length encoded; host bandwidth measured; warning above 12 players kept.

---

## 11. Mods
- Mods = zip files in a `mods/` folder chosen once via the File System Access API (Chrome/Edge/Opera). Fallback: drag & drop zip (Firefox/Safari/mobile). Browser re-asks folder permission each session (one click).
- Zip layout mirrors packs: `pack.ts|js`, `characters/`, `items/`, `maps/`, `rules/`, `i18n/`, `assets/`.
- JS or TS; TS transpiled in-browser by a lazy-loaded transpiler. A `.d.ts` of the kernel + core-combat API ships for editor autocompletion.
- Hot reload key re-reads the folder; offline/training only. Schema changes on reload: new fields get defaults, removed fields dropped.
- Load-time validation: missing fields, impossible values, id collisions → clear panel before playing.
- Runtime error panel: file, line, attack/item, values at failure; the faulty hook is disabled.
- Security: mods run with page privileges. Warning before enabling a mod from an unknown source. Sandboxing later.
- Built-in packs are written against the same public API (dogfooding guarantees mods can do anything the game does).

---

## 12. Debug system (`packs/dev-tools`, off by default in Options)
- **Logger:** categories × levels, ring buffer, stripped from production builds (zero cost).
- **Event journal:** last N seconds of sim events (who, what, values, frame).
- **Inspector:** click an entity → live state from schema; frame step; rewind using rollback snapshots; trigger any item/status.
- **Invariants:** NaN, out-of-range HP/positions, stale handles, schema violations → first failure produces a report.
- **Determinism sanitizer:** §3.7.
- **Profiler:** time per system per frame, allocation counter.
- **Bug report = replay** (seed, settings, content hash, inputs, commands) + logs + last snapshots. Headless CLI replays it to a given frame and dumps state.
- **Error file auto-download** option (kept from the old game).
- **Trace mode** (deep debug, per category): records each hook call with pack/file, event payload before and after the hook, and the system that emitted it; records every settings/config change with old → new value and source. Off by default; sampled to stay cheap.
- **Dependency diagnostics:** on boot, prints the resolved pack graph, overrides applied, hooks per phase, and warns about unused/duplicate hooks (same output as `pnpm graph`).

---

## 13. Bug lab (`packs/lab`, secret code `ewekeks` on title screen)
Config screen (number of parallel matches, characters, items, rules, duration, forced random rollbacks, simulated lag/loss) → runs matches in Web Workers with CPUs → each match is verified twice (straight replay, and with random rollbacks); any hash difference, invariant failure or exception is collected with its replay. Live counters; export one report file. Same lab runs headless in Node for me.

---

## 14. Tests and CI
- Scenario DSL: `scenario().players('touhou:reimu','touhou:marisa').give(0,'touhou:black-hole').run(120).expect(...)`. One test file next to every attack/item.
- Determinism tests (fuzz inputs twice, and with random rollbacks) — mandatory for every pack.
- Golden replays with stored final hashes; intentional balance change = explicit golden update in the same commit.
- Parity harness vs old game: a frozen copy of the old game lives in `legacy/shmup-fighter.html`. Same inputs run in both; compare observables (damage, durations, speeds, positions, statuses) with tolerance. **Parity scenarios are short and isolate one mechanic** (one attack, one item, one interaction, ≤ ~2 s): the new deterministic trig makes long full matches diverge chaotically, so full-match parity is checked by humans, not by numbers.
- Playwright: every screen with keyboard, pad emulation and touch-only; mobile viewport; screenshots.
- Benchmarks: sim step time, snapshot time, bullets throughput, with budgets; CI fails when a budget regresses by more than 10 %.
- Workers: unit tests for each route (playlist, search, thumb, TURN credentials) run locally with Wrangler's test environment; a scheduled health check calls the deployed workers and opens an issue on failure; the game shows a clear message when a worker is down.
- Data validation tests: every content file, string table, map and setting schema is validated in CI.
- CI order: typecheck → lint (boundaries, determinism bans, file size) → unit/scenario → determinism → goldens → build → Playwright → deploy. Any failure blocks deploy.

---

## 15. Conventions
- Files `kebab-case`, file name = content id. One file answers one question; split when a file exceeds ~300 lines or holds two concepts; never create files of a few trivial lines.
- Character layout:
```
packs/touhou/characters/reimu/
  character.ts  shot.ts  heavy/{neutral,forward,back}.ts
  melee/{jab,lunge,strong,dash-attack}.ts  spell.ts
  skills/{skill-1,skill-2}.ts  passive.ts  cpu.ts
  visuals/{body,weapon}.ts  sounds.ts  i18n/{en,fr}.json  tests/
```
- Items: `packs/touhou/items/<family>/<item>/{item.ts, item.test.ts, visuals.ts?}`.
- Balance numbers live in the content file that uses them (typed `params`), never as magic numbers in systems. Shared constants in `packs/core-combat/tuning/`.
- No global mutable variables outside the kernel state container.

---

## 16. Documentation
- `CLAUDE.md`: rules for working in the repo, commands, checklist per change.
- `PROJECT_MAP.md`: "to change X, open Y" table.
- `docs/ARCHITECTURE.md`, short `README.md` per pack (entry points, public API, events used).
- `docs/adr/NNNN-title.md`: one per important decision with context and rejected options.
- Generated (CI fails if stale): catalog of packs, characters, attacks, items, events, statuses, commands, settings, strings.
- Required guides: `docs/DEBUG.md` (tools, how to diagnose a bug or desync step by step), `docs/ADDING.md` (recipes: new character, item, map, boss, mode, minigame, content type, screen, setting), `docs/MODIFYING.md` (how to change an existing system safely), `docs/MODDING.md` (mod format and API), `docs/errors.md` (error codes), `docs/EXTERNAL.md` (§23).
- Any architectural change updates the relevant doc in the same commit (checklist item in §24).

---

## 17. Porting plan (validated phase by phase)
1. **Audit** the old game: inventory of every system, character move, item, mode, option, net message, worker route, special case. Output: `docs/INVENTORY.md` with checkboxes (the parity checklist).
2. **Skeleton:** repo, CI, kernel, schemas, snapshot/hash, determinism tests, replay format, lab skeleton, docs skeleton.
3. **core-combat + 2 characters + training mode**, with parity harness.
4. **Online** (rollback, lobby, TURN), determinism under rollback.
5. **Remaining characters**, then **items** in families, each with tests and parity checks.
6. **UI screens**, HUD, audio, YouTube pack, map maker, results, select screen.
7. **Mods loader**, hot reload, i18n FR.
8. Full parity review against INVENTORY.md; switch the main link only then.

---

## 18. Whole features as folders (modes, bosses, adventure, minigames)

Requirement: a complete feature (boss fights, adventure mode, classic/arcade mode, minigames, anything unique) is added by **adding one pack folder**, without editing other packs. Sections 2–6 assumed "everything is a versus match"; this section removes that assumption.

### 18.1 The kernel knows worlds, not matches
- A **world** = a set of systems + the state slices they own + a controller list. The kernel steps, snapshots, hashes and rolls back *any* world. "Versus match" is just one world recipe.
- A **mode** pack declares a *flow*: a state machine of steps (`screen`, `world`, `cutscene`, `results`, `branch`) and which world recipe each step uses. Examples:
  - `modes/versus`: select → versus world → results → back.
  - `modes/classic`: ladder of 8 versus worlds against CPUs + final boss + ending.
  - `modes/boss-rush`, `modes/adventure`, `minigames/<name>`.
- Flows nest: any world or flow can be a step of another flow. A minigame is playable standalone (hub slot) *and* as a step inside adventure/classic, with no extra code. Every mode is designed local-first with online co-op/versus available through capabilities (§18.8); online uses the host's profile data.
- A minigame may use **none** of core-combat: it declares its own systems (e.g. platformer physics) and still gets determinism, rollback, replays, lab and debug for free.

### 18.2 core-combat is split into composable system packs
`movement`, `bullets`, `collision`, `health`, `statuses`, `stocks-ko`, `parry`, `spells`, `items`, `camera-rules`, `spawning`. A world recipe lists the systems it uses. A boss fight can drop `stocks-ko` and add `boss-phases`; a minigame can use only `collision` + its own system.

### 18.3 Actors and controllers
- Players, CPUs, bosses, enemies and NPCs are all **actors**. An actor has an archetype (character, boss, enemy…) and a **controller** (human input, CPU AI, boss script, network).
- A boss is built from the same move files as characters (`shot.ts`, `melee/*.ts`, `spell.ts`…) plus `phases/*.ts` and a script controller. Any character move can be reused by a boss and vice versa.

### 18.4 Scripts that survive rollback
JS generators/coroutines cannot be snapshotted. Scripts (boss patterns, cutscenes, tutorials, adventure events) are **serializable state machines**: instruction pointer + local variables stored in state, authored with a builder (`wait(60)`, `until(cond)`, `spawnPattern(...)`, `say('adventure:line-12')`, `branch(...)`). They rewind and replay like everything else. Ban generators in sim code (lint).

### 18.5 Content types are extensible
The kernel does not know "character", "item" or "map". Packs **declare content types** (name, schema, folder convention, loader, validator): `core-combat` declares `character`, `item`, `map`; `adventure` can declare `region`, `dialogue`, `quest`; a mod can declare a brand-new type. The catalog generator and the mod loader work for any declared type.

### 18.6 Extension points for UI and flow
- Hub cards, title menu entries, options panels, results panels, pause-menu entries are **slots** filled by packs (`ui.slot('hub', {...})`). A new mode appears in the hub by existing.
- Screens are registered by packs; the router only knows ids.
- Render **layers** (background, world, bullets, fx, hud, overlay) with explicit z-order; packs add layers instead of patching the renderer.
- Input **action maps** per context (fight, menu, adventure, minigame X); devices map to actions, modes read actions.

### 18.7 Two kinds of persistent data
- **World state**: inside the sim, rolled back, hashed.
- **Profile data**: progression, unlocks, adventure saves, stats, settings, achievements. Outside the sim, schema-versioned with migrations, namespaced per pack. A world receives the profile data it needs as read-only input at start and returns changes as a result (so worlds stay pure and replayable).

### 18.8 Capabilities
Each mode/world recipe declares: players min/max, local/online, rollback-safe, spectatable, needs assets X. The UI and netcode read capabilities instead of hard-coding rules per mode.

### 18.9 Shared standard library (`packs/std`)
Vector math, shapes and collision tests (circle, rect, segment, polygon), spatial grid, tilemaps, pathfinding, easing, deterministic noise, timers. Minigames and bosses build on it instead of copying code from core-combat.

---

## 19. My working environment (built in phase 2, before any porting)

The goal is that I never guess: I can run, see, query and compare anything from the command line.

- **One command:** `pnpm check` = typecheck + lint + tests related to changed files (fast); `pnpm check:all` = everything CI runs.
- **Scaffolding:** `pnpm new character <id>`, `pnpm new item <family>/<id>`, `pnpm new mode <id>`, `pnpm new minigame <id>`, `pnpm new boss <id>`, `pnpm new content-type <id>`. Each generates the folder, manifest, typed stubs, a failing test to fill, README and i18n keys, so every new thing starts correct and consistent.
- **Headless runner:** `pnpm sim run <scenario|replay> --frames N --dump state.json --journal` runs any world without a browser and prints state/events.
- **Journal queries:** `pnpm sim why --replay r.json --entity p1 --frame 1200` lists the events, hooks and values that changed that entity, with the pack/file responsible.
- **Divergence bisect:** `pnpm sim bisect a.json b.json` finds the first frame and first field where two runs differ (desyncs, regressions, parity vs old game).
- **Deep links:** the game boots straight into any situation by URL, e.g. `?world=versus&p1=touhou:reimu&p2=touhou:marisa&give=0:touhou:black-hole&frame=300&pause=1`. Playwright and humans use the same links; bug reports include one.
- **Frame screenshots:** `pnpm shot "<deep link>" --frames 0,60,120` renders those frames to PNG (Playwright, fixed seed) so I can look at visual results without manual play; screenshot diffs catch visual regressions.
- **Pack graph:** `pnpm graph` prints the dependency graph of packs, hooks per event phase, and which pack overrides what.
- **Generated catalogs** (§16) are my index: I read the catalog first, then only the files it points to.
- **Old-game bridge:** the old `shmup-fighter.html` runs headless with the same scenario API (parity harness), so "is this the same as before?" is a command, not a guess.
- **Fast feedback:** TypeScript project references per pack, Vitest related-file mode, Vite HMR for UI; content hot reload in dev uses the same path as mods.

---

## 20. Conventions and systems that every pack relies on

### 20.1 Units (no exceptions)
Durations in **frames** (integers, 60 per second); distances in arena pixels at scale 1; angles in radians, 0 = right, clockwise positive (screen y down); speeds in px/frame; percentages as 0–1. Helpers `sec(2)`/`deg(45)` convert when authoring. Units appear in field names when ambiguous (`durationF`, `radiusPx`).

### 20.2 World config (the first record of every replay)
`{ kernelVersion, contentHash, seed, worldRecipe, rules, players[{slot, actor, controller, team, color}], loadOrder }`. Rules (lives, timer, items, teams, map…) are part of the config, hashed, chosen by the host online. Changing them mid-world is a command (§6).

### 20.3 Settings registry
Packs declare settings `{ id, schema, default, scope, ui }`. Scope is either **client** (volume, effects, bindings, video opacity — never read by the sim) or **rule** (goes into world config). The Options screen and the rules screen are generated from the registry plus optional custom panels. Dev options are client settings, off by default.

### 20.4 CPU AI and scripts produce inputs
CPU and boss controllers output `InputFrame`s (or script actions for bosses), they never write state directly. Same rules for humans and AI ⇒ fair, replayable, debuggable. Per-actor `cpu.ts` files; difficulty levels are params.

### 20.5 Viewports and cameras
Render supports N viewports (local split views, spectator, picture-in-picture). Cameras are presentation, driven by sim view modifiers (§4.5). Transparent layers allow the YouTube video background behind the arena.

### 20.6 Quality tiers
`low / medium / high`, auto-detected on first run, client setting: particle budget, resolution scale, blur, interpolation. Gameplay never depends on tier.

### 20.7 Assets and content policy
- No AI-generated assets (sounds, music, images, sprites). Every asset file has an entry in the pack's `assets/CREDITS.md` (origin, author). CI fails on unlisted assets.
- No religious references, deities or pentagrams in content; neutral equivalents. Review checklist item for every content change.
- Assets are loaded lazily per world/screen from a pack manifest.
- Touhou fan-work guidelines are respected (non-commercial fan game, credit to Team Shanghai Alice).
- Accessibility: full remapping, Effects OFF, readable colour choices for teams/players (colour-blind-safe palette option).

### 20.8 Public API versioning
`@kernel` and each pack's public API follow semver. Breaking changes need an ADR, a migration note and a version bump; deprecated APIs keep working for one major version. A compatibility test suite runs a set of sample mods against the current API.

### 20.9 Kernel change policy
The kernel changes only through an ADR plus the full determinism and golden suite. Most "kernel" ideas belong in a pack.

### 20.10 Error codes
Every reported error has a stable code (`E-NET-003`, `E-MOD-012`…) documented in `docs/errors.md` with cause and fix. Error panels and reports show the code; I can search it.

### 20.11 Failure containment outside the sim
Each UI screen has an error boundary (fallback panel + report, rest of the app alive). Render or audio errors never stop the sim or the netcode.

### 20.12 Migration from the old game
Proto3 is served from the same origin (`lithlithcn.github.io`) as the old game, so it can import the old `localStorage` data on first run: nickname, picture, stats, bindings, settings, YouTube player state, custom maps (format converter). Import is idempotent and logged.

### 20.13 Mods can ship tests
A mod may include `tests/` scenarios; dev-tools and the lab can run them, so mod authors get the same safety net as the base game.

---

## 21. Feature integration checklist (answer before coding any new feature)

For every new request (character, item, boss, mode, minigame, screen, system…), write the answers in the PR/commit notes and ask the owner only the questions that are about taste or game design:
1. Which **pack** owns it? New pack or existing one?
2. Which **content types** does it add or use? Need a new content type?
3. Which **world recipe(s)** and **systems** run it? New system or composition of existing ones?
4. What **state** does it add (schema slice)? What must survive rollback?
5. Which **events/hooks** does it emit or listen to, in which phase?
6. Does it need **commands** (changes during a world)?
7. Which **settings** (client vs rule)?
8. Which **UI slots/screens**, which **input action map**?
9. **Text** keys (en/fr), **assets** (+ credits), **sounds/music** (priority vs YouTube)?
10. **Capabilities**: players min/max, online, spectate, mobile/touch.
11. **Effects OFF / photosensitivity** behaviour, quality tiers.
12. **Profile data**: progression, unlocks, saves (+ migration).
13. **Performance** budget impact (bullets, entities, draw calls).
14. **Tests**: scenarios, determinism, goldens, Playwright, lab coverage.
15. **Docs**: catalog regenerated, PROJECT_MAP/README/ADR if architecture moved.

---

## 23. External dependencies (all of them, explicitly)
| Dependency | Used for | If it fails |
|---|---|---|
| GitHub Pages | hosting the game | game unreachable; static build can be moved to any host |
| PeerJS public signalling server (`0.peerjs.com`) | players finding each other online (kept by owner's choice) | online lobby cannot be created/joined; clear error; local play unaffected |
| Cloudflare Worker `sf-turn` + Cloudflare Realtime TURN | relay when direct WebRTC fails | fallback to Metered TURN, then direct-only; diagnostics show relay status |
| Cloudflare Worker `sort-maker` | YouTube playlist, search, thumbnail proxy | player shows message, game music used |
| YouTube IFrame API | music/video playback | player disabled, game music used |
| Google STUN servers | NAT discovery | other STUN entries, then TURN |
No other runtime network dependency is allowed without an entry here.

---

## 24. Working method for every task (from the Proto3 brief §10)
1. Understand the expected result; ask taste/design questions early (owner prefers questions over wasted work).
2. Identify the packs/systems concerned (PROJECT_MAP, catalogs).
3. Check their dependencies (`pnpm graph`).
4. Choose the most targeted architectural solution; run the §21 checklist.
5. Evaluate regression risks (goldens, parity, determinism).
6. Make the smallest correct change; never rewrite a whole system when a targeted change suffices; no new abstraction without a reason.
7. Test the concerned systems (`pnpm check`), then everything (`pnpm check:all`) before pushing.
8. Verify nothing else broke (goldens, Playwright, lab smoke run).
9. Update docs/catalog/ADR in the same commit.
10. Push; CI deploys only if everything passes.

**Real-device check:** emulators are not enough; each phase ends with the owner testing on his PC and phone (list of things to try provided by me).

**Definition of done for a ported feature:** behaviour matches the old game (parity scenario passes), tests exist next to the code, works on keyboard/pad/touch, works online if capable, respects Effects OFF, documented in the catalog, ticked in `docs/INVENTORY.md`.

---

## 25. Risk register (keep adding)
| # | Risk | Mitigation |
|---|---|---|
| R1 | Transcendental Math differs across browsers | §3.1 ban + `sim.math` |
| R2 | Mods call non-deterministic APIs | §3.7 sanitizer + lab double runs |
| R3 | Unstable sort tie order | §3.4 |
| R4 | Old replays after updates | content hash in replay; refuse with message |
| R5 | Mid-match setting changes | commands only (§6) |
| R6 | Hot reload online | locked (§10.3) |
| R7 | Stale entity references | handles with generation (§4.3) |
| R8 | Snapshot cost / GC at 32 players | schema-generated preallocated copies (§4.2) |
| R9 | Mod state/name collisions | namespaces + explicit overrides (§2.4, §4.2) |
| R10 | Priority wars between hooks | phases + constraints (§5.2) |
| R11 | Infinite event loops | queued events + max depth (§5.4) |
| R12 | Mod exception mid-match online | deterministic disable (§5.5) |
| R13 | Dependencies dying | minimal pinned deps; static output |
| R14 | Over-engineering up front | fix formats now, implement on demand (§17) |
| R15 | RNG shift when content changes | per-pack RNG streams (§3.3) |
| R16 | DOM/GC hitches during fights | HUD in render, Svelte idle during match (§8.3) |
| R17 | Items that rewind/inspect state | `history` service inside state (§4.5) |
| R18 | Render deciding gameplay | view modifiers in sim state (§4.5) |
| R19 | Bullet cap bypass | single spawn path + test (§4.3) |
| R20 | Rollback ghost FX/sounds | event-keyed FX cancel (§7) |
| R21 | Interpolation making things look worse | toggle + screenshot tests (§7) |
| R22 | Mods unavailable on Firefox/Safari/mobile folder API | zip drag & drop fallback (§11) |
| R23 | Host bandwidth at 32 players | packed inputs, measurement (§10.5) |
| R24 | Spectator mid-join needs full state | schema serializer (§10.1) |
| R25 | Docs drifting from code | generated catalogs + CI check (§16) |
| R26 | Hidden-tab throttling stalls net | worker clock (§9) |
| R27 | Parity impossible to exact decimal | tolerance-based parity harness (§14) |
| R28 | localStorage size limits | saves/settings in localStorage (small, versioned); mods/replays in IndexedDB |
| R29 | Save/settings format changes | schema version + migrations |
| R30 | Photosensitive effects | Effects OFF tested; no full-screen flash in OFF |
| R31 | Kernel assumes "a match", blocking new modes | worlds + flows (§18.1) |
| R32 | New mode needs combat internals | composable system packs + std lib (§18.2, §18.9) |
| R33 | Coroutines not snapshottable (boss scripts, cutscenes) | serializable script machines, generators banned (§18.4) |
| R34 | New kinds of content need kernel changes | packs declare content types (§18.5) |
| R35 | Adding a mode requires editing hub/menus | UI slots, screen registry (§18.6) |
| R36 | Progression mixed with sim state breaks replays | world state vs profile data (§18.7) |
| R37 | Per-mode rules hard-coded in UI/netcode | capabilities (§18.8) |
| R38 | Inconsistent new content (missing tests, i18n, docs) | scaffolding generators (§19) |
| R39 | Guessing instead of observing | headless runner, journal queries, bisect, deep links, frame screenshots (§19) |
| R40 | Online co-op in story/adventure worlds with save data | world receives read-only profile input, returns results; host's profile used online |
| R41 | Unit confusion (frames vs seconds, deg vs rad) | units convention (§20.1) |
| R42 | Client settings leaking into sim | settings scopes (§20.3) |
| R43 | AI cheating / unreplayable AI | AI outputs inputs only (§20.4) |
| R44 | Untracked or AI-generated assets | CREDITS.md + CI check (§20.7) |
| R45 | Mods broken by engine updates | semver public API + compatibility suite (§20.8) |
| R46 | Kernel bloat over time | kernel change policy (§20.9) |
| R47 | One UI crash kills the app | error boundaries (§20.11) |
| R48 | Players lose their old data | origin-shared import (§20.12) |
| R49 | New features integrated inconsistently | integration checklist (§21) |
| R50 | Building future features too early | build-now/later list (§0.15) |
| R51 | Rollback resimulation too slow at many players | 1.5 ms step budget + adaptive delay (§9) |
| R52 | Long parity scenarios diverge chaotically | short single-mechanic parity scenarios (§14) |
| R53 | Mods cannot use Svelte screens | framework-agnostic screen interface (§8.15) |
| R54 | Locale/recursion-dependent behaviour | extra determinism bans (§3.10) |
| R55 | Nested history snapshots explode memory | no nested history, capped size (§4.5) |
| R56 | Emulator-only testing misses real bugs | owner real-device check per phase (§24) |
| R57 | Legacy netcode snapshots the whole object graph generically (SNAPG roots + deep walk), including visual state (shake, flash, chroma); Proto3 snapshots are schema-based, so any state missing from a schema silently desyncs | invariants + double-run lab + "state not in schema" sanitizer (§12); parity scenarios with rollback |
| R58 | Legacy maps embed user-written JavaScript (`new Function('api','frame','P','B',js)`) running every frame inside the sim, plus event rules, image/GIF layers, custom music, `.sfmap.json` import/export and maps sent over the network | map = a pack-like content type; scripts run through the mod sandbox API with `sim.math`/seeded rng only; imported legacy maps converted; network maps carry content hash; never trust remote code without explicit consent |
| R59 | Legacy online keeps the game running in hidden tabs via a Worker-driven netTick loop | Worker clock kept (already §3), covered by Playwright hidden-tab test |
| R60 | Legacy rollback params (input delay 2, window NMAXP=10, checksum every 60 frames, `CX.mer` double-step) are balance-adjacent | copy as defaults, parity-tested; any change goes through ADR |
| R61 | The sf-turn worker restricts origins to an allow-list (lithlithcn.github.io, html-classic.itch.zone) | Proto3 on lithlithcn.github.io/proto3 shares the origin, so no change needed; new hosts must be added deliberately |
| R62 | The legacy game's behaviour is the sum of layered wrappers; first parity batch alone exposed 3 hidden ones (TAU=6.2832 used for angle wrapping, a step wrapper halving per-step spirit gains <25, Reimu's dash overridden to a 150 px teleport) | every ported mechanic needs a parity scenario; read the *final* effective behaviour from the running legacy game (`tools/parity/legacy.cjs`), not just the base function |
| R63 | Scenario assertions that don't actually exercise the mechanic pass vacuously | scenarios assert their own precondition (e.g. a KO really happened) |
| R64 | Hidden input-buffer wrappers in legacy: starting any non-idle action empties the whole press buffer, then an end-of-step wrapper re-stamps the same press (unless that key was stamped ≤ 8 frames ago); frozen frames (hit-stop, KO slow-mo) run only the base step, so the wrapper does not run there | ported as `updatePlayer` buffer clear + `input-buffer` system skipped when `skip`; found by the tech-timing divergence at a wall; scenarios with spam inputs |
| R65 | Hit-stun/atk `pr('dash')` etc. read the buffer, but `atk` reads `p.prev.melee` AFTER prev was overwritten, i.e. "held now", not "held last frame" | `updAtk` uses `held()`; do not "fix" it |
| R67 | A parried attacker is set to parrystun with t = 50 inside `melee`, then `atk` immediately re-checks `t >= start+act+rec` and sets idle: moves shorter than 50 frames are NOT actually punished by the parry stun | keep: `updAtk` re-reads `t` live after the strike; decide deliberately (not by accident) if the owner wants it fixed |
| R68 | Humans' heavy button is charge-on-hold in legacy (press starts charge, release fires; hold ≥60 f = LV2 extra shots, ≥120 f + 15 spirit = LV3 ring); CPUs fire on press; the wrapper also rewrites the press buffer and prev-state. Plus `spawnH` wrapper adds the extra bullets | `begin()` (input) + `heavyBullet`; the net layer must send raw buttons, never the transformed ones |
| R69 | Knife-edge thresholds: heavy bullets arm when travelled distance >= `arm` (60 px = 6 frames x speed 10 exactly); legacy's own sin/cos noise puts it at 59.999999999999986 or 60 depending on the angle, so one frame of arming can differ between engines/implementations | only matters for targets within ~60-70 px of the muzzle; tests keep scenarios off the edge; `sim.math.hypot` now replicates V8's algorithm bit for bit |
| R70 | Reimu's `inp` hook turns a NEUTRAL-stick heavy press from idle into the yin-yang orb charge (heavy N is entity-based, ported with her character batch); scenarios must never press heavy with a neutral stick or after the geometry makes the stick neutral relative to the aim | tests hold the stick toward/away from the foe |
| R71 | KO beam direction came from `vx||kbx`: friction leaves residues like 1e-19 that are truthy in JS, so two engines can pick different angles for the same KO (legacy had an exact 0). Also legacy `lastByF||-1e9` treats frame 0 as unset | `ko()` ignores velocity components < 1e-9 (deliberate improvement over the legacy expression); tests never credit a kill at frame 0 |
| R72 | Spells: legacy picks the next card with the global `rng()`, and its hit-stun spell cancel only refreshed the "held" flag when the key object existed (stale flag = missed cancels). Deliberate deviations: a named stream `combat:spell` (or `spPick` for lab/tests) chooses the card; the cancel uses the button's real rising edge; the pool is ordered by content id, not by legacy CHR order | tests pin the pool to Reimu's card; `spPick` documented in `packs/combat/README.md` |
| R73 | Legacy BURST is dead code in the final game (`doBurst=()=>{}`, burst forced to 0 each step, the burst button is remapped to `next`/skill). NOT ported on purpose; the `burst` field remains only for the gauge UI until removed | decision recorded in INVENTORY |
| R74 | (DONE in batch 7 for the 11 shared cards; the 8 character cards follow with their characters) The spell cards use per-bullet closures (`fn(b)`: homing, curves, delayed splits) which state cannot hold. They will be re-expressed as data-driven bullet behaviours (id + params in typed arrays), not copied | next batch; parity via per-frame bullet comparison |
| R75 | Spell patterns draw from ONE spell RNG (legacy mulberry32 kept on purpose, state `spSeed`, rollback-safe) in a fixed order: card pick, then pattern draws in bullet-index order. Changing the order of draws in a card changes every later card of the match | cards are parity-tested including the final seed value; new cards must draw in a stable order |
| R76 | Per-bullet behaviours are data (`bkind` + `bp0..2`, age `bag`, curve/drag/accel columns), applied after the whole frame like the legacy wrapper; adding a column means adding its name to `bullets/arrays.ts` (compaction/clear are generic) | one list, tested by hash equality in the parity suite |
| R77 | Generic entity pool (`combat/ents.ts`, `MAX_ENT` 128, per-entity per-player hit cooldown stamps `ehc`); characters own kinds (Reimu `EK_ORB/EK_BAR`) and tick them | pool full → spawn dropped; compaction keeps order; hash-checked by parity `E` compare |
| R78 | Skill hooks: `CharacterDef.inp/skill1/skill2` run from `input.begin` (legacy outermost updP wrapper); next/prev are stripped from the input. Deviation: the lobby "switch character with prev/next in the first 120 frames" is NOT ported (belongs to the future lobby UI) | skills are edge-triggered; tests press at f≥150 |
| R79 | Spirit slow-down (x0.5) applies only to gains before character `tick`s; tick gains (orb hits) stay whole, as in legacy (`settleSpirit` + re-snapshot in `char-tick`) | parity `orbs` test compares spirit every frame |
| R80 | Item cards live in combat (`items/cards.ts`: spawn every ITEM_EVERY, Last Word every ULT_EVERY, capture gauge); item behaviours are content type `item` (`ItemDef.give`, ordered by `order` = legacy list index, so the card draw matches). Cards share the single legacy RNG stream with spells (`spRand`) | adding an item = one file in `packs/touhou/items/` + its `order`; parity test restricts the pool via `world.itemSet` |
| R81 | Legacy bullet loop reads `b.vx/b.vy` live after a mirror bounce (collision margin and swept distance use the NEW velocity); port does the same, owner is re-read per target | parity `mirror-giant` |
| R82 | Ownerless entities (`owner -1`, e.g. healing orbs, kind >= 100 reserved for items) survive every player's death | heal orbs compared as legacy `ORBS` |
| R83 | Not yet ported (listed in INVENTORY): item `dowse` card placement (Nazrin), `itemOn.rainbow` toggle, card load sound/UI, test/training item mode | |
| R84 | Deviation: a hit empties the victim's capture gauge on EVERY card (legacy: only `CARDS[0]`, an accident of the global `item`). Parity tests use one card at a time | `cards` test (maxCards 1) |
| R85 | Hit-source ids for the stun-repeat reduction are explicit (`ISRC` 16-63 items, 64+ characters, `NSRC` 128) instead of legacy move-object identity: every move that should repeat-reduce needs a unique id | new moves/items must claim an id |
| R86 | Dropped dead code: legacy `elixir` (`p.star`: invincible burn) is shadowed by `GIVE.elixir` (status `fx.elx`, port with the statuses batch); the `inEdge` helper is now one shared function that honours Warp | |
| R87 | Statuses (`fx`): one timer column per player indexed by stable slot (`FXS`, content type `status` = slot + `end` hook), ticked by system `status`. Deviation: legacy iterated `for k in fx` (insertion order, and a timer set by an end hook sometimes ticked the same frame, depending on key history); port ticks in slot order and a timer set by an end hook starts next frame | parity `elixir` |
| R88 | KO guards (Immortal) are `combat:ko:before` hooks that cancel the KO, not wrappers around `ko` | `touhou/hooks/imm-guard.ts` |
| R89 | Item entities (holes, bumpers, bombs, orbs) are ownerless (`eo -1`, holder stored in a spare column) so they outlive a KO like in the legacy lists; frozen bullets are a flag (`BF.frozen`) skipped by the bullet loop, not a separate list | parity `Black Hole, Bumpers, Perfect Freeze` |
| R90 | Rifle, Camera, Spark, Fairies, Clone, The World ported with explicit state (no closures): rifle bolt = heavy bullet with `BF.rifle/pierce/oneshot` flags (a parried bolt gains `oneshot` and kills its shooter; the rifle pierces in the heavy clash); fairies = ownerless entities (`eo -1`, holder `eg`, hp `ew`, loot `er`); time stop = `tstop/tso` scalars that gate player/physics/bullet systems (legacy `fz`) | parity `base items` |
| R91 | Clone shots: legacy fed a pseudo-player object to the shot function; the port moves the shooter (x, y, aim) to the twin for the duration of the call and restores it, so every character's shot code works unchanged | parity `Doppelganger` |
| R92 | Character input hooks must yield to item-driven Heavy (rifle, camera, later Gungnir): Reimu's charge hook checks `rifle/cam` (legacy line 4650 guard) | parity `Rifle`, `Tengu Camera` |
| R93 | Shared ray system (`combat/rays.ts`, entity kind 10): legacy `chRay` entity with warning/follow/spin/push/clear flags; runs in a dedicated `ray-step` system after `char-tick`. Per-owner entity handlers (`CharacterDef.ents`, e.g. Marisa potion/puddle/trail) run right after it, not interleaved in global legacy ENT order (no observable difference in the parity scenarios). Spirit slow-down snapshot `spP` is re-taken at the end of the step because legacy gains made after the char tick are not halved. | Deliberate restructure |
| R94 | `item-late` now runs before `char-tick` (legacy wrapper order), skill presses are ignored while `gf<120` and idle (legacy used them to switch character in the lobby, R78), spell pool is ordered by `CharacterDef.order` (= legacy roster) so adding characters never shifts card indices. | Parity fix |
| R95 | Marisa's Blazing Star trail (`mtr`) is a real hitbox (3 dmg, 14 px, 20 f shared cooldown per victim, skips invincible foes), not just cosmetic; ported as entity kind 5. Potion flight stores origin/target in er/eh/ea/ew (columns the harness compares) instead of the legacy vx/vy. Cosmetic-only legacy bits (CPU hook, draw hooks) deferred to the CPU/renderer phases. | Parity note |
| R96 | Hecatia: Moon needles carry legacy `acc:14`, which in the old engine means *clamp speed to 9* (pass 1) then *+5 % while slower than acc* (pass 2). The port keeps both inside `behave()`; bullets born from character entities (statue volleys) skip the clamp once (`bag = -1`) because legacy created them after that pass. Wavy shots (`bwav/bph`), gravity orbs (`BF.hgr`) and Cranberry-trap convergence (`bct/btx/bty`) are generic bullet columns. | Parity detail |
| R97 | Float noise: legacy accumulates bullet travel with `Math.hypot` (last-ulp differences from the sim hypot), so a heavy bullet's `dist>=arm` check can flip one frame at exact multiples (e.g. Hecatia's first star: 6 px x 10 = arm 60). Parity scenarios avoid firing such shots within graze range of the foe; no gameplay impact. Spell-pool tests now size the legacy `SPELLS` list from the port pool automatically. | Test note |
| R98 | New character hooks (`doutM`, `dinM`, `spdM`, `onHit`), `slowT` (x0.5 speed status, Hecatia's Moon planet) and `chHitQ` (hazard hit that respects Parry) are shared by every character; entity kinds: Reimu 1-2, Marisa 3-5, Flandre 6-9, Hecatia 200-202 (200+ reserved for characters). | Structure |
| R99 | Nue's Disguise: in legacy the hooks are looked up by the player's shot type, so swapping it makes Nue use the target's whole kit (shot, melee, heavies, skills, tick) and spell card. The port does the same by swapping `charIdx` + `spI` for 4 s (touhou system `disguise` restores them and keeps her clouds / UFOs running). `BF.fake` = harmless decoy bullet (skips every player collision). | Parity detail |
| R100 | Okina: season bullets carry `bsea` (spring heals the shooter, autumn shoves, winter slows; applied just before damage in `bullets/sea.ts`); the season is stored by her tick so the shot of the changing frame still uses the old season (legacy). Rays accept an origin (`x`,`y`) for door lasers. Entity kinds 206-208. Doors / dancers / big door are plain entities owned by Okina (no per-door closures). | Parity detail |
| R101 | Nazrin: mouse shots are light bullets with `bnsf` (burrow frame) that turn into sentinel entities (max 6); marked-foe homing strength is set each frame by her entity hook. Dig bonus and shield use `dinM` / `spdM` / `onHit` hooks (lunge steals up to 25 spirit). The detection-cone entity (`ncn`) was purely cosmetic in legacy and is not simulated; the renderer will draw it from the `nTg/nTgF` state. Entity kinds 209-213. | Structure |
| R102 | Aya: the dash-trail entity (`mtr` with `aya` flag), the photo flash, the Heavy B wave ring and the SCOOP newspaper effect are cosmetic in legacy → trail/wave/flash are not simulated (the photo emits `touhou:aya-photo`, Hyper Dash `touhou:aya-hyper` for the renderer); the newspaper entity is kept (position parity) but, as in legacy, has no gameplay effect. Tailwind caches its direction in `er/eh` (no per-frame trig). Parity probes exclude the legacy cosmetic `mtr`. |
| R103 | Randomised all-pairs fuzz (`tests/parity/fuzz.test.ts`, 16 matchups × 1800 frames of bot-like inputs) found ordering bugs that targeted scenarios hid. Fixed: (a) entities now run in ONE pass in creation order (legacy chStep: rays and every character kind interleaved), dispatched by KIND (`CharacterDef.entKinds`) not by the owner's current kit (a disguised Nue keeps running her own entities; the disguise system no longer calls `nueEnts`); entities that legacy updates after the bullet loop (Nue UFO) use `postEnts`/`postKinds`; (b) the bullet pattern pass (curve/drag/accel+clamp/behaviour kind, children included) runs right after the base step and BEFORE the character hooks (system `bullet-motion`), the `acc` +5 % rule lives in `bulletMods` after it — this replaces the R93 `bag<0` skip-once hack (removed). |
| R104 | A melee move keeps the kit it started with (`mvCh`): legacy stores the move object in `startAtk`, so a Nue disguise swap mid-attack must not change the running move's timings. |
| R105 | Legacy shares one hit-data object (`SPH`) between every pattern heavy bullet, so the 8 %-per-repeat stun reduction applies across all of them (per victim, 120 f); ported as the hit source `ISRC.sph`. Hand-made bullets (`customHeavy`) stay untracked (fresh object per call in legacy). |
| R106 | `lightHit` marks `spellHit` when the attacker is casting (legacy chBullet) so the capture bonus is not paid to a foe that was hit by light spell bullets; `nearFoe(..., max)` gained the legacy range limit (Okina's door shots / spit / door rays: 1500 px, else the shot goes along her aim). |
| R107 | Nazrin: a swinging pendulum bats her own sentinel mice within 18 px (30 px for the big one) at the nearest foe within 900 px (9 px/f, 6 dmg) — missed by the first port, found by the fuzz. |
| R108 | Not replicated (legacy bugs, found by the fuzz): the spell-cancel-from-hit-stun edge flag `spHv` only updates on frames whose input object contains a `spell` key (online `decI` omits false keys) → after one press it never re-arms; the port reads the real button state. The parity harness now sends full button maps. Dash steering with a stick exactly anti-parallel to the velocity is a float coin flip (R97 family): the fuzz adds ±0.02 stick noise. |
| R109 | Fuzz seed salted for aya/reimu: a Fantasy Seal orb (heavy, reflected) homed with `d` at exactly ±π (bullet heading anti-parallel to its target, 1e-12 px apart); the legacy sign flips on ulp noise, so the two sims legitimately diverge (same family as R97). Homing target is also fixed at cast (`bp2`, legacy closure `o`) instead of re-read live. | Port + fuzz |
| R110 | The legacy game does NOT use V8's `Math.*`: it overrides sin/cos/atan/atan2/hypot/log/exp/pow with its own deterministic series (block "maths déterministes"; `hypot` = sqrt(a²+b²), `sin` = degree-19 Taylor after `Math.round` reduction). The port's older Taylor/Cody-Waite/V8-hypot versions differed by ~1 ulp, flipping knife-edge thresholds (`bdist >= barm`, R97 family). `src/kernel/math.ts` is now an EXACT port of that block; `tests/math-legacy.test.ts` evaluates the legacy block itself and compares bit for bit. Not a deviation: parity at the last bit. | closed |
| R111 | "Spell refused" feedback (`spRef`) was only evaluated in castable states; legacy evaluates it in every state (only spirit/ult/45-frame cooldown gate it). Fixed in `spellInput`. | closed |
| R112 | Heavy-vs-light sweep (`heavyClash`) ignored legacy's `!b.fake` filter; and spell heavies (`patternHeavy`) never became breakers when the caster held Parry (legacy `breaker:p.state==='spell'&&p.in.b.parry`). Breakers are excluded from the sweep, so a missing breaker flag deleted enemy bullets and gave +0.3 spirit. | closed |
| R113 | Behaviour kinds (orbit/moth/doll…) used the bullet's CURRENT owner; legacy closes over the CASTER, so a parry-reflected Kepler ring kept orbiting its original caster. New `bcast` array (caster at spawn); `run()` uses it. | closed |
| R114 | Melee clash was also triggered against heavy-shot moves; legacy excludes any move with `spd` (`!o.mv.spd && !m.spd`). Found by the new bot personas (5 of 6 new divergences were this). | closed |
| R115 | Stun-repeat reduction is keyed by the hit-data OBJECT in legacy; the port keyed by move name, so a character's own override (e.g. Nue's dashatk) shared a counter with the default dashatk. Overrides now get their own source id (64 + char*8 + move). | closed |
| R116 | Random bots almost never reached wall bounces, hits at the edge of invulnerability, combos or clashes (mutation testing: `wall-bounce-damp` needed 48 games x 2400 f, `inv-threshold` survived). `fuzzbot` now has 4 personas (random, brawler, zoner, corner-driver) selected by seed; they exposed 6 real divergences at once. Keep adding personas/scenarios whenever mutation testing shows a survivor. | open (ongoing) |
| R117 | Float association/order drifts of 1 ulp that accumulate (found by the personas via exact-bit comparison, not tolerance): damage factors were multiplied together first then by the raw damage (legacy multiplies the raw damage one wrapper at a time, outermost first); bullet acceleration `vx*n/l` vs legacy `vx*=n/l`. Rule: when porting an expression keep the legacy operation order EXACTLY; verify with the bit-exact drift probe when a gradual-drift signature appears. | closed |
| R118 | Menus are drawn on the canvas (packs/ui, typed rewrite of the legacy screens), not Svelte/DOM as §8 planned: the legacy look is canvas code, and drawing through a Ctx2D lets `pnpm ui` prove each screen op-identical to the legacy one (gradient ids, OC overlay clear and the legacy 'WebGL unavailable — 2D mode' notice excluded: the port has no WebGL layer). Screen interface stays framework-agnostic (draw/nav). | closed |
| R119 | Effects OFF was not fully epilepsy-safe in legacy: the READY?/FIGHT! intro, GAME! and LAST STOCK! overlays drew full-screen white flashes (alpha up to 0.8) and a 1.1 Hz red heartbeat outside the OFF wrapper. Port: overlays get `fxOff` and skip them; the fight draw uses `safeView`. | closed |
| R120 | Legacy wrote the per-name records (STATS) and the hub card counters (SFST) to the same `sf_stats` key: each save erased the other. Port: records in `sf_records`, per-name entries of an old `sf_stats` imported once. | closed |
| R121 | Themed items touch shared legacy functions (chPre/chHit/chDmg/chBullet/…) in a fixed order sharing the rng: porting them as independent hooks would scramble the draws. Port: one `rules` content (packs/themed/rules.ts) whose functions keep the legacy branch order, called at the legacy points; it owns the status countdown (`tickFxP`) when present. | closed |
| R122 | Presentation state derived from item gives (legacy `p.acts`, ITEMK, CX globals) had no owner, so every item's on-screen feedback silently vanished while sim parity stayed green. Port: juice owns the activation list (`acts`, pruned with combat `itemActive` = legacy xActive), the CX view is rebuilt from the themed slice (`packs/render/ld/cx.ts`), and the render compare forces gives (`PLAN=`) so item visuals/sounds are checked per item. | closed |
| R123 | Base items were sim-identical but their presentation (sounds, banners, particles) was never checked: a forced-give render sweep shows gaps on most of them (pickup juice, blade/rifle/bomb/freeze sounds, heal FX, warp, camera, The World...). Fix item by item; an item joins `RITEMS` (gate --items) once its render compare is STRICT OK. Done for every ported item (2026-11-17). | closed |
| R66 | Stun-repeat reduction is a wrapper around `hit` that records the hit even when the victim is invulnerable and the hit is rejected | `hit()` computes it before the invulnerability return |

## 26. Owner decisions log
- 2026-11-14: legacy `.sfmap.json` maps do NOT need importing into Proto3.
- 2026-11-14: maps received over the network that contain code (scripts) show a consent warning before running (R58).
- 2026-11-14: the tutorial becomes a folder pack (`packs/tutorial/`, one file per lesson) instead of a hard-coded step list.
- 2026-11-17: lot 3 UI = clean typed rewrite with the same look (owner: "beaucoup de menus" will change later), verified op by op against legacy.
- 2026-11-14: build order = skeleton (kernel, tests, CI, docs) first, then Reimu alone, then the others.

## 26. Diagnostics & observability (decisions)
Adopted: (1) report = JSON first, always stamped with the git commit (+dirty flag); (2) diagnosis levels: *standard* = invariants + `world.reports` (always cheap), *detailed* = per-frame field diffs vs the oracle (`pnpm parity`), *forensic* = per-system writer attribution (`world.sysTrace`, only on the failing frame); (3) forensic replay = deterministic re-run from (chars, seed, items, inputs) — already exact because the sim is deterministic and snapshot/hash-checked; (4) planned with the UI: invariant checker (NaN/Infinity, hp/array bounds, entity lifecycle) in dev builds, ring buffer of the last seconds + one-click JSON(+HTML) export with source-mapped stacks (browser downloads need a user gesture/permission, so export is a button + optional auto-download after consent).
Rejected: a watcher on every variable (state is typed arrays: before/after diffs per system give the same answer at no runtime cost); correlation ids / Worker tracing (the sim is single-threaded and synchronous). Limit: a report gives evidence and the first divergence, not a guaranteed root cause.

**Two systems (owner's requirement), both built into the engine/tooling:** (A) *oracle* = `pnpm parity` (port vs frozen legacy, every same-name player field + bullets/entities/cards/beams, per-system writers, coverage list in SUMMARY.md); (B) *self-diagnosis* = `src/kernel/invariants.ts` + `packs/*/invariants.ts` (`WorldConfig.diag` 0/1/2): pack contracts + non-finite scan of every float field, reports `E_INVARIANT` / `E_NONFINITE` with array, index, value; campaign + tests run at level 2 and any report is a finding even when the port equals legacy. Every new pack/system ships its invariants (§21 checklist). Calibrated on identical games: zero false positives over 49 games x 1500 frames. Limits: invariants only catch what a contract states; the oracle only covers what legacy can show.

**Loop (A→D) and what exists:** Observe = `sysTrace` + provenance window (writes to the watched element over the last 12 frames, bullet/entity births, despawns by system) · Detect = oracle + invariants (`covers` → measurable coverage in SUMMARY: combat 27/218 fields have a value contract, the rest only the NaN scan) · Diagnose = reports split into `facts / confirmed / probable / hypotheses / missing` (never a guessed cause presented as fact) · Fix+verify = `pnpm parity verify <dir>` replays every report (+600 frames) → FIXED / STILL / CHANGED, then a fresh campaign + `pnpm check`. Neutrality proven by `tests/diagnostics-neutral.test.ts` (diag 0/1/2 + tracer ⇒ identical state hashes; snapshot→restore replays exactly). Known gaps: stateful invariants (transition legality, expected-but-missing events), legacy-side provenance (values only), births/despawns identified by index (compaction), 191/218 combat fields without a value contract.

**Round 3 (after the second review):** stable object identity = `bid/bborn` (bullets) and `eid/eborn` (entities), unique per match, never reused, moved by compaction (`stamp()` at every spawn site); provenance window is 60 frames by default (`--window N`) and follows a bullet by id across slot changes; despawns list the removed ids with owner/src/birth frame. `verify` replays to the report's full original length (>= +600): a bug that only moved later is MOVED/CHANGED, never FIXED. `pnpm parity keep <report>` freezes a fixed bug into `tests/regressions/*.json` (replayed against legacy by `pnpm test`); fix validation = (1) the scenario, (2) system tests, (3) `pnpm check` + a fresh campaign. Neutrality: states at 48 checkpoints identical for diag 0/1/2; measured cost over 1200 frames: off 72 ms, level 1 66 ms, level 2 132 ms (budget asserted). Still open: transition/event invariants, legacy-side provenance, value contracts only where meaningful (no 100 % target).

## 27. Specification & knowledge system (decision, 2026-11-15)
**Purpose (permanent, owner's words):** Proto3 exists to be the best possible workspace for the AI that maintains it: understand fast, know where to act, see the consequences, detect/diagnose/reproduce bugs without the owner explaining, verify fixes, add features without breaking old ones, for years. Every architectural decision is judged by: *does this make the AI more efficient, informed and autonomous long-term?* No artificial complexity: each tool must earn its place.

**Answer to "a spec per element so 30→40 damage is caught":** the *definition* already is data (content files: `MoveDef`, `CharacterDef`, items, statuses, tuning `T`; balance numbers never live in systems). A second hand-written spec would be duplication that drifts. So the spec layer is **derived**, and its trust comes from sources independent of the code that could be wrong:
| Source of truth | Catches | Where |
|---|---|---|
| Legacy oracle (frozen game) | any ported behaviour/number that differs, incl. a 30→40 edit made in code AND lock | `pnpm parity`, `tests/contracts.test.ts` (T + MOVES vs legacy values) |
| Contract lock (reference/implementation split) | any content number changed without a deliberate `pnpm spec lock` + reason (visible in the diff) | `docs/contracts.lock.json` (508 numbers), `tests/contracts.test.ts` |
| Invariants (self-diagnosis) | impossible values/transitions even with no oracle (new features) | `packs/*/invariants.ts`, `WorldConfig.diag` |
| Frozen regressions | a fixed bug returning | `tests/regressions/` |
| Behavioural scenarios / human validation | NEW features that have no oracle: their reference is a reviewed scenario + the owner's play-test, never "whatever the code does" | rule: a new mechanic ships with a scenario test written from the stated rule, not from its output |
| Metadata (what an AI reads before a change) | wrong place/ignored dependency | `pnpm map <term>` — live registries (pack deps, systems order, events, invariants+covers, content numbers, tests, docs, frozen regressions); nothing to maintain by hand |
**Rules:** (1) never edit content and its lock in the same step without saying why; (2) a legacy-ported number may only differ from legacy through a DESIGN §25 deviation row; (3) tests for new features are derived from the rule, not from observed output; (4) no per-element spec files: a spec is added only where an invariant or contract has value (below).
**Next slices (only when earned, not before):** (a) *hit ledger*: each hit event carries `{src, base, mods[], final}` and an invariant checks `final == base × ∏mods` against the content contract of `src` (catches runtime damage drift for NEW content); (b) transition/event invariants (KO consequences, create/destroy consistency); (c) `pnpm map` gains per-system "state slices read/written" from the provenance tracer; (d) auto-generated catalog from the same registries.
**Limits (honest):** the lock proves *stability*, not *correctness*; correctness comes from legacy parity (ported content) and scenario tests + owner validation (new content). A wrong rule stated once in a scenario is still wrong: that is why §21 asks to restate the rule before coding.

## 28. Detection as the core: gate, render parity, mutation score (decision, 2026-11-15)
**Principle:** the two detection systems (A: oracle comparison with the legacy game — temporary, dies when parity is complete; B: self-diagnosis — permanent, defends every future feature) are not accessories: *every lot of work is defined by them*. A lot is done only when `pnpm gate` passes.
**The gate (`tools/gate.ts`)**: typecheck + lint + all tests → oracle campaign on a fresh seed per commit (0 divergences; `--items` adds all items) → coverage ratchet (`docs/coverage.baseline.json`: fields with value contracts per pack may not drop, fields not compared with the oracle may not grow; `--bless` raises the bar deliberately). Output ends `GATE PASS` / `GATE FAIL <step>`.
**Render parity (the visual half of "identical copy")** — until now only numbers were compared; what is drawn was not. Foundation built:
- `tools/parity/recorder.cjs`: records every Canvas-2D call + every effective property change (save/restore aware, colours normalised; offscreen sprite canvases get their own stream). The legacy harness draws one frame with `L.render()` (the legacy 2D path; its WebGL bullet batching is an optimisation of the same picture) and returns the stream, with who-drew-what markers (wrapped `draw*` functions) that the comparison ignores but uses to name the culprit. Cosmetic `Math.random` is seeded in the harness so frames are reproducible.
- **Port rule:** the port's renderer draws ONLY through a `Ctx2D` it is handed (never a global canvas), so the same recorder can wrap it; the faithful port issues the same call stream. `diffOps(legacy, port)` gives the first differing op, the 3 before it, and the legacy draw function responsible. Presentation code may use `Math.random` (not sim code) but must consume it in the legacy order while parity is measured.
- When streams differ, `tools/render/raster.ts` replays a stream in Chromium to a PNG (`pnpm render legacy a,b <frames> out.png` to SEE a legacy frame headlessly); pixel diff of legacy-vs-port PNGs is the arbiter for deliberate improvements (optimised batching, fewer state changes) that keep the picture identical.
- Not yet covered: images/video drawn from `Image` objects (stubbed), real WebGL output, audio, DOM menus — each needs its own recorder when ported.
**Mutation score (`pnpm mutate` → `docs/MUTATION.generated.md`)**: ~20 realistic bugs (balance constants, off-by-one, boundary `<`/`<=`, subtle math drift, missing effects, regressions of fixed bugs, character data, item data, math edge) are injected one at a time; a short campaign + the frozen-regression/contract tests must notice each. Survivors are blind spots (improve bots, add invariants/regressions) or equivalent mutants (document why). This is the only honest measure of "is detection good enough?"; re-run after adding detectors or changing bots.
**Still open (tracked, not hidden):** transition/event invariants; per-system read/write slices in `pnpm map`; render parity for menus/UI; the robots do not play modes/maps/teams/CPU/online (needs scripted scenarios per feature); the lab (hundreds of parallel games) when the port is complete.

### 28.x Speed of the fix loop (2026-11-15, owner: "1 h → 10 min, 10 min → 1 min")
Measured on the item-divergence batch: ~half the time went to hand-written probes (who writes this legacy variable? which bullets exist on one side only? what does the stand-in lack?). Now automatic:
- `pnpm rca <report.json>` — one digest: PORT writers + spawns/removals, LEGACY writers of the same variable (setter hook + call stack), legacy functions newly called at the failing frame (with callers), legacy bullets born that frame next to the port's, per-player running timers (clone, disguise…), counts, one-sided bullets, hints. Replaces /tmp/ent.ts, hp.ts, bl2.ts, rx.ts, dbg3.ts.
- `pnpm parity --matrix` — EVERY item × EVERY character as holder, scripted give at f40, opponents rotate: 128 games x 700 f in ~65 s on 2 cores (workers default = all cores). Deterministic coverage instead of seed lottery; reports carry `plan` so replay/verify/keep/rca reproduce them. `pnpm gate --items` runs it.
- `pnpm spec standin` — static scan: per character, the `p.<field>` reads of shot/heavy that the legacy Doppelganger stand-in (`cloneOf`: only x,y,id,aim,buff,power,focus,mvName,shotT) lacks, and whether the port handles `clone`. This whole family caused 10 divergences; now reviewed in one command.
- `pnpm check:fast` — 8 s instead of 116 s (skips the parity/fuzz/regression suites); the full `pnpm check` / `pnpm gate` run once per lot, not per edit.
Rule: a divergence is first read with `pnpm rca`; only if it stays unclear add a probe, and then extend rca with it.

### 28.y Investigation environment (paused-project foundations)
- `pnpm rca <report>`: port + legacy writers, born bullets, timers. `pnpm investigate <report>`: rca + ddmin of gives + hypotheses (not created / wrong spot / culled) + quirk lookup (`docs/quirks.json`).
- `docs/parity-ledger.json` (`pnpm spec ledger`): every area is validated / diverging / not-ported / comparison-disabled / unverifiable. GATE PASS means configured checks pass, never "port complete"; never improve coverage by disabling a comparison without a ledger entry.
- `pnpm parity keep <report> --cause …` forces a post-mortem (cause, family, quirk, why missed, probes); `pnpm metrics` reports real timings (manual work before the tool existed is not counted as a gain).
- `pnpm affected [--run]`: smallest check set for the current diff; widens when unsure.
