# UI (menus and screens)
## Rule
Same screens and look as the legacy game: title (warp stars, galaxy, planet, logo that shakes on directional input, sound-unlock veil), hub (8 skewed tiles, graph navigation, chips with the current rules, description bar, player card with level from XP = wins*3 + KOs + games), 0.55 s oblique-band transition between screens. Keyboard, pointer (hover/click regions), pad and touch all reduce to nav events (up/down/left/right/ok/back/reset/tabL/tabR/start/sel).
## Legacy
`function drawTitle`, `function titleBG`, `function uiBG`, `function uiTrans`, `const HUB=`, `function drawMenu` (+ its wrappers: hubFX/hubProfile, HUBG graph `hubMove=`), `function ornFrame`, `function nav(` / `function onKey(` wrapper chains, `saveOpts`/`loadOpts`. Oddities: the FIGHT tile text is overridden by the character-select wrapper; `Digit1` = ok on the hub.
## Port
- Router: `packs/ui/app.ts` (`renderUi`, `nav`, `onKey`, `APP.mode`); shell `src/main.ts` (pointer hot regions, first gesture only unlocks audio).
- Screens: `packs/ui/screens/title/title.ts`, `packs/ui/screens/title/bg.ts`, `packs/ui/screens/hub/hub.ts`, `packs/ui/screens/hub/deco.ts`, `packs/ui/screens/hub/icons.ts`; shared `packs/ui/core.ts` (UiCtx, fonts, skewRect, ornFrame), `packs/ui/bg.ts`, `packs/ui/trans.ts`.
- Settings with the legacy storage keys: `packs/ui/settings.ts` (`SET`, `loadSettings`, `saveSettings`).
## Tests
`pnpm ui [scenario]` (`tools/ui/compare.ts`): legacy render() vs port per scenario (state + clock), op diff; run by `tests/parity/ui.test.ts`. Random decorations are copied legacy -> port, later Math.random pinned to 0.5.
## Bugs
(none yet)
## Not ported yet
Character select, sub-menus (rules/options/help/sound/profiles/teams), items list, controls, guide, pause, results, intro/GAME!, last stock banner, training, online lobby, map maker, YouTube sidebar (`sb` = 0), touch layer, pad polling.
