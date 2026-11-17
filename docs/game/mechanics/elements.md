# Elements (auras, bullet elements)
## Rule
Every item has an element (legacy ITEMEL: 1 FIRE … 9 LIGHT). While a player's last item is elemental and one of his statuses runs, he has that element (`el`, shown under him). Bullets take an element the first time the scan sees them (tags: water 2, flower 7, yy/pure/star 9, dark/weird 8, note 5, cocoon 7, else the owner's element). A bullet landing (or a melee hit by an elemental attacker, 10-frame cooldown) leaves its element on the victim as a 4 s aura (drawn as an arc). Every 2 frames bullets are bucketed on a 48 px grid; two different-element, different-owner bullets of one cell are tested for a reaction (light vs light only 30 % of the time: an rng draw).
## Not ported yet
Reactions (RX table: STEAM, MELT, OVERLOAD … ANNIHILATION) and element entities (ENTEL: flake, fire, puddle …): ledger `elements-reactions`. The oracle runs legacy with RX emptied, so a meeting spends the rng draw and nothing else.
## Legacy
Lines 1759-1832 (ITEMEL, ENTEL, auraOf, RX, xReact, xAura, chBullet/chHit wrappers, chPre5), draw `chDraw5` (aura arc, element name).
## Port
`packs/themed/elements.ts` (`elemPre` = chPre5 at the end of the themed `pre`, `elemBullet`, `elemHit`), columns `el/auraEl/auraT/mvEl`, bullet columns `btag` (BT tags) / `bel`, render `q.aura` (`packs/render/ld/bind.ts`), ELN9/ELC9/auraOf in `packs/render/ld/themed.ts`.
## Tests
`tests/parity/themed-a.test.ts` (Elements: two elemental holders duel; the harness compares the shared rng state every frame).
## Bugs
See `docs/game/bugs.md` (legacy draws read statuses by key).
