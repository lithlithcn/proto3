# Frame order (legacy `step` vs port systems)
## Rule
Within one frame the legacy game runs: base `step` (players, physics, bullet update incl. each bullet's `fn()` callback, shared rng draws) → every later `step` wrapper (acc clamp, Doppelganger soak, bumpers, freeze queue, The World knives, ...) in file order → outermost `chStep` (character ticks, entity loop, per-bullet mods such as `acc` +5 %). A system that draws from the shared rng or reads bullet positions must sit at the same point.
## Legacy
`step=()=>{const w0=WT;S0();...}` wrappers (search `const S0=step`); `chStep` holds the entity loop and the `b.acc`/`b.mst` bullet mods; `rng()` is one shared stream (`seed`).
## Port
`packs/combat/systems.ts` (system list + `after` constraints): players → physics → bullets → … → `bullet-motion` → `item-late` (clone soak, bumpers, freeze queue, time-stop knives) → `char-tick` → `ray-step` (entities, bullet mods, post hooks). Shared stream: `spRand` in `packs/combat/bullets/pattern.ts`.
## Tests
Regressions `tests/regressions/*` (update-order family), matrix `pnpm parity --matrix`.
## Bugs
- Soaked bullet got the +5 % of `acc` / absorbed one step early: clone soak ran before motion (okina/hecatia seed 22).
- Knife angles drawn before a `dollH` callback drew: item-late ran before motion (nue/nazrin seed 57).
