# Item rules (themed-item framework)
## Rule
Themed items change shared game rules (who a hit can touch, damage factors, per-frame effects, special states). Every item branch runs at the legacy point and in the legacy order, because they share the sim rng and the frame order.
## Legacy
`function chPre` .. `chPre5` (called from `updWorld`, after KO beams / global effects), `function chHit`, `function chDmg`, `function chBullet`, `function chMelee`, `function chSpeed`, `function chKill`, `updEaten` / `updCocoon` / `updPray` in `updP`, `xSpitWall` at the top of `wall()`. The status countdown (`for(const k in f)`, PERMFX skipped) lives inside `chPre`.
## Port
- Extension points: `packs/combat/rules.ts` (`RulesDef`: `pre`, `hit`, `dmg`, `bullet`, `melee`, `speed`, `kill`, `state`, `wall`; content type `rules`). Call sites: status system (`pre`, which then owns `tickFxP`), `hit` in `packs/combat/player/hit.ts`, `scaleDamage` / `speedMul` in `packs/combat/stats.ts`, bullet hits in `packs/combat/bullets/update.ts` and `packs/combat/bullets/heavy.ts`, Attack in `packs/combat/player/idle.ts`, `ko` in `packs/combat/player/ko.ts`, item states in `packs/combat/player/update.ts`, `wall` in `packs/combat/player/physics.ts`.
- The themed rule set: `packs/themed/rules.ts` (bodies in legacy order), per-item logic in `packs/themed/<item>.ts`, state slice `packs/themed/state.ts`, items `packs/themed/items/`, statuses `packs/themed/statuses/`.
- Plan and inventory of the 115 items: `docs/game/items/themed-plan.md`.
## Tests
`tests/parity/themed-a.test.ts` (`themed(key, …)`: give the item at frame 60 on both sides, compare every frame, legacy probes).
## Bugs
(none yet)
