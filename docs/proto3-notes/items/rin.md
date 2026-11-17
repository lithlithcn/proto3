# Anonymous Fairy (Rin Satsuki)
## Rule
8 s anonymous mode (global): every fighter is drawn as the same grey silhouette, names read `???`, HUD panels and mini-HUDs vanish. 5 decoys appear within ±350 × ±250 px of the owner (clamped 40 px from the edges, random mirror signs) and copy the owner's velocity mirrored per axis, bouncing off a 30 px margin; their aim mirrors the owner's. Decoys vanish with the owner.
## Legacy
`GIVE.rin` (line 880), `CX.anon` (tick in `chPre` line 999, draws 1986/1988/3615/3664/3948/4716), `updEnt` case `'decoy'` (1081), `xActive` (`CX.anon>0`).
## Port
`packs/themed/rin.ts` (`EK_DECOY` = 301, `decoy`; `ew`/`eh` = sx/sy), item `packs/themed/items/rin.ts`, `anon` in `packs/themed/state.ts`, tick in `packs/themed/rules.ts` `pre`, `active` rule (xActive); render: `CX.anon` from `packs/render/ld/cx.ts`, HUD hidden in `packs/render/hud.ts`.
## Tests
`tests/parity/themed-a.test.ts` (Rin: 600 frames, decoys + CX.anon per frame); render `PLAN=rin@100/0 pnpm render compare` (gate --items).
## Bugs
(none yet)
