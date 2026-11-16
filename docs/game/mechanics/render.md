# Render (presentation)
## Rule
The view is drawn through a given `CanvasRenderingContext2D` (so ops can be recorded and compared with the legacy recorder). Camera follows the player, leaning 30 % to the foe (max 220 px), eased 12 %/frame; scale = canvas height / 600. Nothing here touches sim state.
## Legacy
`drawView`, `drawP`, `drawHeavy`, `bSpr` (light bullet sprite), `drawHUD`, `render` (search these names). Legacy also has a WebGL bullet layer, post-effects (filters, shake, chroma) and many per-character draw functions: NOT ported yet.
## Port
`packs/render/view.ts` (`drawView`), `packs/render/arena.ts` (floor, grid, danger edge), `packs/render/actors.ts` (`drawPlayer`, `drawBullet`), `packs/render/camera.ts`, `packs/render/hud.ts` (`drawHudPanel`, legacy drawHUD: name, stocks, HP/spirit bars, dash, wall pips, status line; team colours/pictures/unported item statuses missing), `packs/render/cards.ts` (item cards), boot in `src/main.ts` (Reimu vs Marisa, keyboard).
## Tests
None yet: render parity (port ops vs legacy ops) is the next step; ledger entry `render-parity` stays not-ported until then.
## Bugs
- none yet

## HUD (drawHUD) — ported
Port: `packs/render/hud.ts` (+ `ui.ts` helpers). Legacy: final `drawHUD` (~line 3948). `pnpm render compare` → drawHUD 8/8 identical (gradient ids renumbered, shake translate excluded: uses Math.random).
Not yet: team colours, Last-Stock pulse, profile names, `wsA` inverted HP, hidden HUD while anonymous/Koishi.
Gotcha: the legacy HUD state (HUDS) lerps once per rendered frame, so the port must draw every frame; compare restores state before sampling.

## Juice (presentation effects) — ported, verified per frame
- State: `packs/render/juice/state.ts` (legacy globals shake/zk/kx/chroma/bright/focusL/zblur/flashS/invF + FX/TX/RINGS/WAVES/LINES/KOFX/BIG/CRACK/GZ). `tickJuice` = legacy `stepFx`.
- Feed: combat events + the `combat:fx` command channel (`packs/combat/jfx.ts`: spark/burst/txt/big/flash/addJ/maxJ/pushJ) called at the exact legacy juice site. Hooks only journal (they run inside the sanitized sim window); `syncJuice` replays them in order, `combat:fx-tick` (system `base-end`, the legacy `stepFx` point) ticks.
- Character juice lives in the sim files of each character (jfx calls) or in `packs/touhoufx/presentation/juice.ts` for touhou events.
- Oracle: `pnpm render compare a,b frames` prints, per juice variable, the first frame that differs + the legacy html line that pushed (`legacy pushes`), legacy sfx sites and the port events of that frame. FX is compared as pushes per frame (lifetimes are random).
- Known open: TX cap order (legacy dedupes at the 2381 wrapper, port in the tick), hlB count in spells 06/08/10/11, Nue `nDs` shadow trail (field not ported), Reimu `rbnd` entity (not ported).

## Verbatim legacy rendering (ld/) — 2026-11-16
- `packs/render/ld/*.ts` hold the legacy drawing code copied verbatim (`// @ts-nocheck`): view.ts (drawView + floor décor dynBG + cards + bullet sprites + heavy chain + tags/names/mini-HUD/indicators/danger), layers.ts (drawP chain), chars.ts (8 character draws + EMB), world.ts (drawWorldItems chain + every EDR), ifx.ts (item particles), themed.ts (chDraw..5), viewfx.ts (juice layers), screen.ts (banners, flash, speed lines, spell UI, timer, item line, CSS filter).
- `ld/bind.ts` is the only adapter: it maps legacy names (`q.x`, `q.fx.koishi`, `P`, `B`, `ENT`, `CARDS`, juice lists) onto the SoA state. Fix a visual bug there (wrong field) or in the copied file (legacy bug, document the deviation).
- Regenerate nothing by hand: the copies were produced from line ranges of the legacy file; if a block must change, edit the copy and note it here.
- Parity: `pnpm render compare a,b frames` (cosmetic randomness pinned to 0.5 on both sides, clock pinned to 0). `DIFFCTX=<drawFn>` prints the ops around the first difference.
- Known gaps: q.acts (item activation log), profiles/names, replay HUD, maps (drawMapObj), WebGL bullet path, themed item state (lot 3).
