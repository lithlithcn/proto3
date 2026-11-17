# Bug log (every fixed divergence: symptom, cause, what failed, fix)
Written by `pnpm parity keep ... --cause ... [--attempts "tried X: failed"]`; read it (and `docs/quirks.json`) before fixing anything similar. Newest last. Index: [README](README.md).

## 2026-11-15 · nazrin/flandre · spawn-bounds
- Symptom: bullet count differs after a Nue-pool spell cast at the map edge (seed 100033).
- Cause: legacy `addB` spawns 14 px ahead with NO bounds check; the port used `sB`, which refuses outside the map. Seen when Warp puts a player at the edge.
- Fix in: `packs/combat/bullets/pattern.ts` (`addB`) · quirk `addb-no-bounds`
- Not detected earlier because: the matrix did not exist; random campaigns rarely cast at the edge.
- Regression: `tests/regressions/bullet_count___nazrin-flandre-100033.json`

## 2026-11-15 · okina/hecatia · update-order
- Symptom: Hecatia `acc` bullet vx 9.14 (port) vs 8.71 (legacy) at the frame the Doppelganger absorbs it (seed 22).
- Cause: the port ran the clone soak BEFORE bullet motion; legacy runs it after motion + acc clamp and before chStep's bullet mods, so a soaked bullet never gets the acc +5 % (and is tested at its post-motion position).
- Fix in: `packs/combat/systems.ts` · quirk `clone-soak-after-motion`
- Not detected earlier because: needed clone + an `acc` bullet absorbed in the same frame.
- Regression: `tests/regressions/B#_vx_hecatia__okina-hecatia-2200071.json`

## 2026-11-15 · nue/nazrin · update-order
- Symptom: The World knives spawned at other angles than legacy (seed 57).
- Cause: every legacy `step` wrapper (clone soak, bumpers, freeze queue, knives) runs after the base step incl. bullet motion; the port ran item-late before motion, so the shared rng was drawn in another order (knives vs a `dollH` fn callback).
- Fix in: `packs/combat/systems.ts` · see [frame-order](mechanics/frame-order.md)
- Not detected earlier because: needs The World active while a bullet callback draws rng.
- Regression: `tests/regressions/B#_x_nue__nue-nazrin-5700191.json`

## 2026-11-15 · reimu/flandre + reimu/nue · radius-giant
- Symptom: Reimu's dash landed 15 px off at a wall while Oni-giant (seeds 5700187, 5700203).
- Cause: teleport clamp used raw `T.BODY_R`; legacy wrapper uses `bodyR(p)` (giant-aware). Quirk `bodyr-vs-raw`.
- Fix in: `packs/touhou/characters/reimu/dash.ts`
- Not detected earlier because: needs Oni + a dash into a wall.
- Regression: `tests/regressions/P#_y_reimu__reimu-flandre-5700187.json`, `tests/regressions/P#_x_reimu__reimu-nue-5700203.json`

## 2026-11-15 · nazrin/nue · stale-tolerance
- Symptom: KO beam direction 3.68 vs 0.023 (seed 5700193).
- Cause: the port treated |vx| < 1e-9 as 0; legacy is `p.vx||p.kbx` (only exact 0 falls back), so a 3e-12 friction residue still picks the direction.
- Fix in: `packs/combat/player/ko.ts`
- Not detected earlier because: needs KO in spell state with only residual velocity.
- Regression: `tests/regressions/K#_a___nazrin-nue-5700193.json`

## 2026-11-15 · combat · spell-ready order (found by the juice oracle)
- Symptom: `pnpm render compare flandre,hecatia 1700` → TX/RINGS one too many at f800: the port fired `spell-ready` for the player who was casting that very frame.
- Cause: port checked `spReady` BEFORE the spell inputs; legacy line 367 runs after them (a cast `return`s first, so READY is not shown that frame).
- Fix in: `packs/combat/player/update.ts`
- Not detected earlier because: `spReady` only drives presentation; the sim oracle never compared it. The per-frame juice oracle (render compare) is what caught it.
- Regression: render compare juice section (no sim report).

## Sounds: heavy-bullet damage sound on silent hit data, rifle pierce, Killing Doll slice (audio port)
- Symptom: `pnpm render compare` SOUNDS → extra `damage00` (reimu,marisa f113; flandre,hecatia f699), missing `se_enep00` (nue,okina f1400), `slice` one frame late then lost after the spell (nazrin,aya).
- Cause: the port passed `spd: 1` for every heavy-bullet hit (legacy `if(m.spd)sfxDmg` is false for `SPH`, `xBall`, rifle); the rifle pierce branch skipped `brk()`; the slice was put on the spell clock instead of the first doll's own turn.
- Fix in: `packs/combat/bullets/heavy.ts` (`BF.mute`), `packs/combat/bullets/pattern.ts` (`BK.dollH`), `packs/touhou/spells/10-killing-doll.ts`
- Not detected earlier because: sounds had no oracle; SOUNDS section of render compare found all three.
- Regression: render compare SOUNDS section (presentation only, no sim report).

## ld draw files: undeclared legacy globals (`hz`, `CVINV`, `GLR`)
- Symptom: browser page error `hz is not defined` on the first frame reaching that draw; `world.ts` had a stub `hz = () => 0` (wrong noise).
- Cause: `@ts-nocheck` verbatim files hide unresolved names until runtime.
- Fix in: `packs/render/ld/viewfx.ts`, `packs/render/ld/world.ts`, `packs/render/ld/view.ts`
- Not detected earlier because: render compare only reaches the frames its seed plays. New detector: `tests/ld-names.test.ts` (type-checks the ld files for unresolved names only).

## Item pickup feedback missing (every item)
- Symptom: taking a card played no `se_cardget`/`se_changeitem`, no "NAME!" banner, ring, flash nor the item's own sound (legacy ISFX); render compare with a forced give showed the sounds missing at the give frame.
- Cause: the juice `combat:item` hook only recorded the give for the records screen; legacy `give0` (line 838) feedback was never ported.
- Fix in: `packs/render/juice/events.ts` (onItem: feedback + activation list), `ItemDef.sfx` (legacy ISFX) in item content.
- Not detected earlier because: the render compare never forced item gives. New: `PLAN=item@frame/player pnpm render compare …`.

## Item activation list / item auras / statuses invisible to legacy draws
- Symptom: no activation banner (drawActs), no item aura trails (ifx), Rumia's darkness ring never drawn.
- Cause: legacy `p.acts` (give0 wrapper line 1979, actsPrune line 2828, xActive line 805) not ported; `ITEMK` empty in ifx/screen; `q.fx.<key>` proxy looked statuses up by HUD label (`DARKNESS`) instead of the legacy key (`eat`).
- Fix in: `packs/render/juice/events.ts` + `state.ts` (acts, ia), `packs/combat/items/active.ts` (itemActive = xActive), `packs/render/ld/bind.ts` (acts, ITEMK, FXS-keyed fx proxy, CX view `ld/cx.ts`), `ld/screen.ts` (shortD).

## 10-text cap applied on hit-stop frames
- Symptom: juice TX list one text shorter than legacy during hit-stop (render compare f171 "GRAZE x20").
- Cause: legacy caps TX in a `step` wrapper (line 2381) that hit-stop / slow-motion frames skip (line 4138); the port capped in every effects tick.
- Fix in: `packs/render/juice/state.ts` (`tickJuice(j, cap)`), fx-tick payload `sk`.

## Mirror Aura bounce silent
- Symptom: no `katanazeroreflect` / `tan02` and no spark when a bullet bounced off the mirror.
- Fix in: `packs/combat/bullets/mirror.ts` (jfx sfx + spark + throttled `mir`).

## Juice of bullet behaviours ticked one frame early
- Symptom: render compare drawView f600: a flea-burst particle one tick older than legacy (alpha .6 vs .667).
- Cause: legacy runs bullet behaviours (rot/drg/acc/fn) in a step wrapper (line 2119) after the base step's stepFx; the port ran `bullet-motion` before `base-end` (the effects tick).
- Fix in: `packs/combat/systems.ts` (base-end → bullet-motion → item-late). Sim order unchanged (base-end only emits the tick).

## Shared rng drift invisible to the oracle
- Symptom: none yet — an rng draw with no visible effect (e.g. the element grid scan) would desync later draws without failing the frame it happened.
- Fix in: `tests/parity/harness.ts` compares the shared rng state (port `spSeed` vs legacy `seed`) every frame.

## Appearance rings, reflected trails, reflect / clone / Rumia feedback
- Symptoms (render compare per item): bullet appearance ring drawn one frame early (legacy `b.bf` is stamped at the next full step, wrapper line 2394); reflected heavy bullets left no `#6ff` trail (line 773) and no burst / MAX POWER banner (765); clone soak had no bursts / "DOPPELGANGER DESTROYED"; clone soaked fake bullets; Rumia's harmless dark wisps (RDK, line 2283) missing; CANCEL xN shown on hit-stop frames.
- Fix in: `packs/combat/systems.ts` (bbf stamp, rules `late`), `bullets/update.ts`, `bullets/heavy.ts`, `items/clone.ts`, `packs/themed/rumia.ts`, juice `RDK`/`SMR`/`stk0` (1up sound on a life gained, chPre5).

## Last Word card cast fired nothing
- Symptom: casting the Last Word (rainbow card) started the spell state but no bullet appeared (forced-give session: sim divergence f197).
- Cause: legacy `ULT` pattern (line 667) never ported; the spell runner skipped `fn` when `ultS`.
- Fix in: `packs/combat/player/ult.ts`, `packs/combat/player/spell.ts`. Test: `tests/parity/items.test.ts` (Last Word cast). Not detected earlier: the item matrix skips the rainbow card.

## Base items silent / without feedback
- Symptoms (forced-give render sweep): Blade hits had no `hitN` sound; Rifle aiming had no charge sound (and its stop); Master Spark charge/release sounds, banner, flash, shake missing; bombs: no `bombtick`, `timeout` countdown, explosion wave/burst/sound/shake; Perfect Freeze: banners and sounds (give, repeats, SHATTER); healing orbs: no +100 text / burst / sound; WARP OVER; fairies: STOLEN / +LOOT / FAIRY DOWN, bursts; Hourai Elixir banners + immortality juice; Tengu Camera: photo sounds, flash, PHOTO glow, SNAP! text; The World: give / start sounds, banners, wave, shake, flash, the charging clock (CX.zaw), knife look; TIME RESUMES; KO beam cancel sound.
- Also: thief fairies' ribbons never drawn (objects rebuilt each frame broke the trail cache); legacy draws during The World redraw the holder (compare mapping); ifx VIEW was always 0; render compare checked heavy bullets with a dead renderer (`actors.ts`, removed).
- Fix in: `packs/combat/items/*` (jfx at the legacy sites), `packs/touhou/items/*`, `packs/render/ld/bind.ts`, `packs/render/juice/*`, `tools/render/compare.ts`.
