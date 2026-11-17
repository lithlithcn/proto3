# The Gate Is Closed (Hong Meiling)
## Rule
10 s: a vertical gate at the owner's x when taken (every fighter's side is recorded). Nobody but the owner can cross it: crossing pushes back to the gate as a wall contact (wall kick / bounce / STREET SMASH rules apply). A foe on the owner's side who comes within both radii + 18 px (not invincible, owner not in hit-stun) eats a RAINBOW KICK (9 dmg, kb 15, stun 34, parryable; 70-frame cooldown per foe). Every foe bullet whose step crosses the gate line is destroyed. Ends early if the owner dies.
## Legacy
`GIVE.meiling` (line 881), CX timer list in `chPre` (998), gate block in `chPre` (1030-1033), `IM.mkick`, draw `chDraw` `CX.wall` (1113) + `SMR` arcs (2294).
## Port
`packs/themed/meiling.ts` (`meilingGate`, called after the per-player loop of `pre`), item `packs/themed/items/meiling.ts`, state `wallX/wallO/wallT/gside/mkCD` (`packs/themed/state.ts`), `ISRC.mkick`, `wallHit` / `parryOn` (combat api), juice `SMR` list (ticked on full steps), CX view `wall` (`packs/render/ld/cx.ts`).
## Tests
`tests/parity/themed-a.test.ts` (Meiling: 760 frames, CX.wall per frame, kick); render `PLAN=meiling@100/0 pnpm render compare` (gate --items).
## Bugs
(none yet)
