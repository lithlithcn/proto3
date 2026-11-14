# combat (core combat systems)

State slice `combat` (schema in `state.ts`): players as struct-of-arrays (`x[p]`, `hp[p]`, …), bullets as compacted struct-of-arrays (`bx[i]`, …, cap `MAX_B`). Time: `gf` = game time (legacy `frame`); kernel frame counts wall steps.

Systems (all phase order in `systems.ts`): `spirit-begin` → `gate` (KO slow-motion, hit-stop, target pick) → `players` → `physics` → `bullets` → `spirit-end`.
Public API for other packs: `@pack/combat/api` (`T`, `PS`, `CharacterDef`, `lightBullet`, `combatOf`, `charOf`).
Events: `combat:graze|power-up|hit-light|ko:before|ko|respawn|spell-ready|dash|glide|wall-kick`.
Content type: `character` (see `character.ts`).

## Ported so far (parity-tested vs legacy, tests/parity/)
Locomotion (walk, focus, run, pivot, brake), dash (+steering, run, lag), glide, wall contact (wall kick, glide bounce), red zone, light shot pipeline, homing bullets, graze/power/spirit, light-bullet damage, KO core (stocks, hit-stop, slow-motion), respawn, spell-gauge slow gain.
## Not yet ported (marked TODO in code)
Melee, heavy shots, parry/grab/breaker, hit()/hitstun/combos/SDI, KO beam, spells, burst/skills, statuses and item hooks, maps (walls/teleporters), teams in damage, heavy-bullet clash.
