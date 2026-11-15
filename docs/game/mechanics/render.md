# Render (presentation)
## Rule
The view is drawn through a given `CanvasRenderingContext2D` (so ops can be recorded and compared with the legacy recorder). Camera follows the player, leaning 30 % to the foe (max 220 px), eased 12 %/frame; scale = canvas height / 600. Nothing here touches sim state.
## Legacy
`drawView`, `drawP`, `drawHeavy`, `bSpr` (light bullet sprite), `drawHUD`, `render` (search these names). Legacy also has a WebGL bullet layer, post-effects (filters, shake, chroma) and many per-character draw functions: NOT ported yet.
## Port
`packs/render/view.ts` (`drawView`), `packs/render/arena.ts` (floor, grid, danger edge), `packs/render/actors.ts` (`drawPlayer`, `drawBullet`), `packs/render/camera.ts`, `packs/render/hud.ts` (temporary compact HUD), boot in `src/main.ts` (Reimu vs Marisa, keyboard).
## Tests
None yet: render parity (port ops vs legacy ops) is the next step; ledger entry `render-parity` stays not-ported until then.
## Bugs
- none yet
