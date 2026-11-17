# The Darkness Feeds (Rumia)
## Rule
8 s of darkness. Every 50 frames a slow homing dark orb (heavy, 24 px, grows to 46 px) flies at the nearest foe and erases the foes' bullets it touches. A foe hit by an orb is EDIBLE for 5 s; an Attack of the darkness holder on an EDIBLE foe swallows it (CHOMP!): held inside the eater for 2.5 s, 2 HP drained every 10 frames (to the eater), then spat out at 24 px/frame along the eater's aim (PTOOEY!). Spat into a wall: K.O. at 0 HP ('MAX POWER K.O.!'), else SPLAT! 16 damage + a wall pip.
## Legacy
`GIVE.rumia`, `fx.eat` in `chPre` (orb spawn, `m:IM.dark`), `b.dark` absorb loop, `chBullet` (`t.dark=frame+300`), `xSwallow` in `chHit`, `function updEaten`, `function xSpitWall` (spit 1).
## Port
`packs/themed/rumia.ts` (`rumiaPre`, `darkAbsorb`, `darkMark`, `rumiaHit`, `updEaten`, `spitWall`), item `packs/themed/items/rumia.ts`, status `packs/themed/statuses/eat.ts` (FXS.eat), bullet flag `BF.dark`, stun-repeat source `ISRC.dark`. Eaten fighters are skipped by light bullets.
## Tests
`tests/parity/themed-a.test.ts` (Rumia: swallow + SPLAT, 1100 frames compared).
## Bugs
(none yet)
