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
