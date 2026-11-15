# CLAUDE.md — working in Proto3

Owner: Houcine (HKN), French-speaking; reply in French, code/docs in English. Minimise token usage; hyper-optimised files; no AI-generated assets (code only); no religious content or pentagrams; never weaken flashiness; mobile must be fully usable by touch; Effects OFF must be epilepsy-safe. Do not attach files already pushed to GitHub.

**Porting freedom (owner's rule):** if something in the legacy code is problematic or can't be ported as-is, do NOT replicate it — recode a better solution, and optimise/improve the legacy logic whenever possible (document it in DESIGN §25 as a deliberate deviation, keep the parity test meaningful).

**Permanent purpose (owner, never forget):** Proto3 is rebuilt not for cleaner code but to be the best, most autonomous, self-sufficient workspace for YOU (the AI): fast to understand, easy to locate where to change, consequences visible, bugs self-detected/diagnosed/reproduced, fixes verified, features added without breaking old ones, maintainable for years. Judge every decision by that (DESIGN §27); invest in foundations now, but no artificial complexity — each tool must earn its place. Before touching an area run `pnpm map <term>`.

**Detection is the core (DESIGN §28):** a lot of work is DONE only when `pnpm gate` prints GATE PASS (check + oracle campaign 0 divergences + coverage ratchet). Fixed bug → `pnpm parity keep <report>`. New feature → rule written first, scenario test from the rule, invariants where a value contract has worth, then gate. Drawing code must draw through a given `Ctx2D` (recordable) — see render parity. Never report "parity complete" without a gate pass and the mutation score (`pnpm mutate`) known.

## Read first
1. `PROJECT_MAP.md` — "to change X, open Y".
2. `docs/DESIGN.md` — the full design (§21 checklist before any new feature, §24 working method, §25 risk register: add every new failure mode).
3. `docs/INVENTORY.md` — parity checklist vs the old game (`legacy/shmup-fighter.html`, frozen).

## Commands
`pnpm check` (typecheck + lint + tests) · `pnpm check:all` (+ build) · `pnpm map <term>` (what to know before touching X) · `pnpm gate` (definition of done) · `pnpm spec lock|check` (content contracts) · `pnpm rca <report.json>` (root cause of one divergence in ~30 lines: port writers + LEGACY writers/calls/born bullets/timers) · `pnpm parity --matrix` (every item × every character) · `pnpm spec standin` (fields the legacy clone stand-in lacks) · `pnpm parity …` / `pnpm mutate` / `pnpm render legacy …` · `pnpm dev` · `pnpm sim demo|run|bisect` · `pnpm audit:legacy` (regenerate old-game inventory).

## Hard rules
- Kernel (`src/kernel`) never imports a pack. Packs import only `@kernel` and packs listed in their `requires`. Enforced by `pnpm lint`.
- Sim code (kernel + packs except `ui/ render/ audio/ presentation/`): no `Math.sin/cos/atan2/hypot/pow/exp/log/random`, `Date`, `performance`, timers, DOM, storage, `.sort(`, `JSON.stringify` — use `sim.math`, `w.rng('<pack>:<stream>')`, `sortBy`. Escape hatch `// sim-allow(reason)` only with a real reason.
- State = numbers + typed arrays declared in a schema. No classes/functions/closures in state.
- Everything that affects the sim is an input or a command. Units: frames, px, radians.
- One concept per file, ≤ 400 lines (lint). File name = content id. Balance numbers live in the content file, not in systems.
- Same commit: code + test + docs (catalog/ADR/PROJECT_MAP if structure changed).
- Never enter or repeat secrets (TURN token lives only in the Cloudflare Worker secret).
- Parity scenarios are short and isolate one mechanic; tolerance-level equality with the legacy game.

## Before coding a feature
Answer DESIGN §21 (which pack, state slice, events, inputs, UI slot, i18n keys, tests, debug output).
