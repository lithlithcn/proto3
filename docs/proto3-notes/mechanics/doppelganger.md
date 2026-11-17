# Doppelganger (item `clone`)
## Rule
10 s mirrored twin (point symmetry around the arena centre): repeats light shots and heavies at 0.7x, soaks foreign bullets (15 hp, heavy = 5).
## Legacy
Shots/heavies are called with `cloneOf(p)`: a BARE object `{x,y,id,aim,buff,power,focus,mvName,shotT}`. Every other `p.<field>` is undefined, writes are lost; entity heavies use `myE(p,..)` so they can kill the real caster's entities. Soak runs in a `step` wrapper AFTER bullet motion. Quirks: `clone-standin`, `clone-soak-after-motion` in `docs/quirks.json`; `pnpm spec standin` lists missing fields per character.
## Port
`packs/combat/items/clone.ts` (`CLONE`, `clonePos`, `cloneAim`, `updateClone`), `packs/combat/player/heavy.ts` (`fireHeavy` clone pass), `packs/combat/player/idle.ts` (shot), per-character `clone` flag in shot/heavy ctx (`packs/combat/character.ts`).
## Tests
Matrix item `clone` x 8 characters; regression `tests/regressions/B#_vx_hecatia__okina-hecatia-2200071.json`.
## Bugs
- Soak order (see frame-order). Open: Nue disguised + clone uses Nue's own shot in legacy (ledger `nue-disguise-clone`).
