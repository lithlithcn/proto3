# combat (core combat systems)

State slice `combat` (schema in `state.ts`): players as struct-of-arrays (`x[p]`, `hp[p]`, …), bullets as compacted struct-of-arrays (`bx[i]`, …, cap `MAX_B`). Time: `gf` = game time (legacy `frame`); kernel frame counts wall steps.

Systems (all phase order in `systems.ts`): `spirit-begin` → `gate` (KO slow-motion, hit-stop with SDI + deferred knockback, target pick) → `players` → `physics` → `bullets` → `input-buffer` → `spirit-end`.
Public API for other packs: `@pack/combat/api` (`T`, `PS`, `CharacterDef`, `lightBullet`, `combatOf`, `charOf`).
Events: `combat:parry|shield-break|clash|grab|graze|power-up|hit-light|ko:before|ko|respawn|spell-ready|dash|glide|wall-kick|hit|wall-pip|tech|wall-bounce|cancel`.
Content type: `character` (see `character.ts`).

## Ported so far (parity-tested vs legacy, tests/parity/)
Locomotion (walk, focus, run, pivot, brake), dash (+steering, run, lag), glide, wall contact (wall kick, glide bounce), red zone, light shot pipeline, homing bullets, graze/power/spirit, light-bullet damage, KO core (stocks, hit-stop, slow-motion), respawn, spell-gauge slow gain, `hit()` (damage, spirit/burst gains, combo, stun decay and stun-repeat reduction, knockback, wall pips, hit-stop), hit-stun, DI/SDI, deferred KO, wall tech / bounce / street smash, melee (jab, lunge, strong with charge, dash attack, hit/spirit cancels, multi-hit), input-buffer wrappers, parry / parrylag / parrystun, parry chain and damage streak, guard gauge + guard crush, grab (breaks parry), melee clash, melee parry.
## Not yet ported (marked TODO in code)
Heavy shots + hit-confirm, breaker (parry+heavy), parry of heavy bullets/beams, KO beam + winner ranking, spells, burst/skills, statuses and item hooks, maps (walls/teleporters), teams in damage, heavy-bullet clash.
