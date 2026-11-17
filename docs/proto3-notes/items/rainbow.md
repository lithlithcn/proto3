# Last Word card (rainbow)
## Rule
Every ULT_EVERY frames (items off) or as a rare card, a rainbow card that takes LW_CAP frames to capture. Holding it, Spell casts the Last Word「Prismatic Danmaku Storm」(ULT_T frames, no spirit cost): every 10 f a rainbow spiral of 8 big balls (heavyN), every 45 f an aimed white fan of 5 (heavyF), every 8 f three small bullets, a flash every 90 f.
## Legacy
`ULT` (line 667), `spD` / `spT` (672), give0 `p.ult=1` (840).
## Port
`packs/combat/player/ult.ts` (`ULT`), `packs/combat/player/spell.ts` (`ultS`), cards `packs/combat/items/cards.ts` (`CARD_ULT`).
## Tests
`tests/parity/items.test.ts` (Last Word card appears; Last Word cast).
## Bugs
Last Word cast fired nothing until 2026-11-17 (see `docs/game/bugs.md`).
