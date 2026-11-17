# Fairy Ambush (Daiyousei)
## Rule
7 fairies (8 s) placed evenly along the perimeter of a screen-sized rectangle around the live players (clamped to the map). Every 26 frames (phase 5 apart) each picks a random live foe and fires: 40 % a big fairy ball (heavy, 12 px, heavyN hit data x0.6, arms like a heavy shot), 30 % a ring of 8 light bullets (random offset, life 200), 30 % a 5-bullet fan (±0.36 rad). Fairies vanish with their owner. (The legacy description says 14 fairies; the code spawns 7 — the code is the rule.)
## Legacy
`GIVE.daiyousei` (line 879), `xR` / `xOnR` (918-920), `updEnt` case `'efairy'` (1079), helpers `hb` / `fb` / `ring` (859-873), draw `EDR`/`chDraw` case `'efairy'`.
## Port
`packs/themed/daiyousei.ts` (`EK_EFAIRY` = 300, `efairy`), item `packs/themed/items/daiyousei.ts`, helpers `packs/themed/fire.ts` (`hb`, `fb`, `ring`, `xR`, `xOnR`), entity hook `RulesDef.ent` called by `updateEnts` (`packs/combat/ents.ts`), render name `packs/render/ld/bind.ts` (`ph` = `eg`).
## Tests
`tests/parity/themed-a.test.ts` (Daiyousei: 620 frames compared, fairies spawned, big balls fired, foe hurt).
## Bugs
(none yet)
