# Bug log (every fixed divergence: symptom, cause, what failed, fix)
Written by `pnpm parity keep ... --cause ... [--attempts "tried X: failed"]`; read it (and `docs/quirks.json`) before fixing anything similar. Newest last. Index: [README](README.md).

## 2026-11-15 · nazrin/flandre · spawn-bounds
- Symptom: bullet count differs after a Nue-pool spell cast at the map edge (seed 100033).
- Cause: legacy `addB` spawns 14 px ahead with NO bounds check; the port used `sB`, which refuses outside the map. Seen when Warp puts a player at the edge.
- Fix in: `packs/combat/bullets/pattern.ts` (`addB`) · quirk `addb-no-bounds`
- Not detected earlier because: the matrix did not exist; random campaigns rarely cast at the edge.
- Regression: `tests/regressions/bullet_count___nazrin-flandre-100033.json`

## 2026-11-15 · okina/hecatia · update-order
- Symptom: Hecatia `acc` bullet vx 9.14 (port) vs 8.71 (legacy) at the frame the Doppelganger absorbs it (seed 22).
- Cause: the port ran the clone soak BEFORE bullet motion; legacy runs it after motion + acc clamp and before chStep's bullet mods, so a soaked bullet never gets the acc +5 % (and is tested at its post-motion position).
- Fix in: `packs/combat/systems.ts` · quirk `clone-soak-after-motion`
- Not detected earlier because: needed clone + an `acc` bullet absorbed in the same frame.
- Regression: `tests/regressions/B#_vx_hecatia__okina-hecatia-2200071.json`

## 2026-11-15 · nue/nazrin · update-order
- Symptom: The World knives spawned at other angles than legacy (seed 57).
- Cause: every legacy `step` wrapper (clone soak, bumpers, freeze queue, knives) runs after the base step incl. bullet motion; the port ran item-late before motion, so the shared rng was drawn in another order (knives vs a `dollH` fn callback).
- Fix in: `packs/combat/systems.ts` · see [frame-order](mechanics/frame-order.md)
- Not detected earlier because: needs The World active while a bullet callback draws rng.
- Regression: `tests/regressions/B#_x_nue__nue-nazrin-5700191.json`

## 2026-11-15 · reimu/flandre + reimu/nue · radius-giant
- Symptom: Reimu's dash landed 15 px off at a wall while Oni-giant (seeds 5700187, 5700203).
- Cause: teleport clamp used raw `T.BODY_R`; legacy wrapper uses `bodyR(p)` (giant-aware). Quirk `bodyr-vs-raw`.
- Fix in: `packs/touhou/characters/reimu/dash.ts`
- Not detected earlier because: needs Oni + a dash into a wall.
- Regression: `tests/regressions/P#_y_reimu__reimu-flandre-5700187.json`, `tests/regressions/P#_x_reimu__reimu-nue-5700203.json`

## 2026-11-15 · nazrin/nue · stale-tolerance
- Symptom: KO beam direction 3.68 vs 0.023 (seed 5700193).
- Cause: the port treated |vx| < 1e-9 as 0; legacy is `p.vx||p.kbx` (only exact 0 falls back), so a 3e-12 friction residue still picks the direction.
- Fix in: `packs/combat/player/ko.ts`
- Not detected earlier because: needs KO in spell state with only residual velocity.
- Regression: `tests/regressions/K#_a___nazrin-nue-5700193.json`
