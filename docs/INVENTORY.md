# Parity checklist — what Proto3 must reproduce

Source of truth for details: [`INVENTORY.generated.md`](INVENTORY.generated.md) (extracted from `legacy/shmup-fighter.html`). A box is ticked only when a parity scenario (old game vs Proto3) passes.

## Scale of the old game
Single 3.27 MB HTML, 1.24 MB script. 393 top-level functions, **69 functions wrapped by later layers** (28 on `step`, 19 on `render`), 8 characters, 131 items, 78 tuning constants, 11 screens, 17 player states, 14 actions, 47 sent / 21 handled net messages, 114 SFX, 14 music files (~15 MB), 25 localStorage keys.

## Checklist
- [ ] Tuning constants `T` (78) — identical values
- [ ] Core combat: movement ✅ focus ✅ dash/run/glide ✅ walls/wall-kick ✅ red zone ✅ graze/power/spirit ✅ light shot+bullets+homing ✅ light damage ✅ KO core ✅ respawn ✅ — still to do: parry, burst/skills, spell, hit()/hitstun/combos, KO beam
- [ ] 17 player states and transitions
- [ ] Shared moves: tslam, grab, heavy N/F/B, jab, lunge, strong, dashatk
- [ ] Characters (each move = 1 parity scenario). Reimu: light shot ✅ dash teleport ✅ melee ✅ heavy F/B ✅ KO beam ✅ spell cards ✅ (11 shared + Reimu; other 7 characters' cards with their characters) burst = removed in legacy, heavy N yin-yang orbs ✅ gather/launch ✅ Border skill ✅ (CPU/draw hooks pending) · Marisa · Flandre · Hecatia · Nue · Okina · Nazrin · Aya
- [ ] Item cards ✅ (spawn/warn/capture/Last Word) · items ported: yellow (blade) ✅ green ✅ purple (warp) ✅ orange (bombs) ✅ mirror ✅ oni (giant) ✅ elixir ✅ gap (Black Hole) ✅ freeze ✅ bumpers ✅ white (Rifle) ✅ blue (Fairies) ✅ clone ✅ spark ✅ world ✅ camera ✅ — 115 pending (all character-themed); 131 items, grouped in families (see generated list), ~70 statuses `fx.*` (framework ✅ slots/tick/end hooks/KO guard; ported: elx, imm — 68 pending), ~68 world effects `CX.*`
- [ ] 25 entity-logic kinds (EST) and 29 entity-draw kinds (EDR)
- [ ] Maps: Large, Screen (fixed camera)
- [ ] Map Maker (6 tabs): GRID (walls/teleporters, size 8–1000 cells, permanent item, bg), LAYERS (image/GIF/sprite-sheet, parallax, scroll, scale, opacity, tile, blend, frames), MUSIC (custom audio), RULES (events: at start / every N s / at N s / on each KO → item, ring, rain, wind, pull, shake, text, sound, layer, heal), SCRIPT (user JavaScript each frame; API: frame,P,T,mem,rng,item,ring,rain,bullet,text,sound,shake,wind,pull,layer,heal), FILE (export/import `.sfmap.json`, duplicate)
- [ ] Network maps (`NETMAP`) shared by the host
- [ ] CPU AI: levels 1–9+, styles zoner/mid/rush, per-level reaction, parry late-timing, action list (jab, lunge, strong, dashin, heavyF, glide, grab, breaker, heavyN), uses seeded rng
- [ ] Modes/screens: title, hub (fight/online/train/rules/items/maps/opt/help), css, csel, game, binds, menu, items, sub, maker, info, online
- [ ] Rules rows, Options rows, Profiles, Records, Teams, Sound
- [ ] Training mode (TEST: infinite, per-power testing)
- [ ] Tutorial: 24 steps (MOVE, SHOOT, SKILLS, FOCUS, GRAZE, DASH, MELEE, HIT CANCEL, BIG DANMAKU, PARRY, PARRY MELEE, RALLY, GRAB, BREAKER, WALL PIPS, KO BEAM, YOUR KO BEAM, REFLECT THE BEAM, SPELL CARD, SPELL BREAKERS, SPELL BURST, TECH, CARDS & POWERS, DONE) with scripted dummy behaviours
- [ ] Controls: keyboard, gamepad (L1/R1, second stick scrubbing), touch-only navigation, mouse
- [ ] Online: PeerJS + TURN, lobby, rules sync, rollback, spectators, 2–32 players, host-shared music
- [ ] Music/YouTube background: playlists, search, player, volume, seek (5 s / 1 s hold / 100 ms), special-music pause, World inversion
- [ ] Audio: 114 SFX, 14 music tracks, music-reactive items
- [ ] Effects tiers FULL/REDUCED/OFF (OFF epilepsy-safe)
- [ ] localStorage import (25 keys) — same origin only if hosted on same origin; else export/import file
- [ ] Workers: sort-maker (/playlist,/search,/thumb) and sf-turn (source not in repos — to retrieve)
- [ ] Replays, error reports, stats

## Architectural findings (risks for the rewrite)
1. **Wrapper layering**: 69 functions redefined `const X0=f; f=…`; behaviour = order of wrappers. Proto3 hooks must replace this with explicit ordered phases; parity tests must pin the order.
2. **Non-determinism**: Math.sin ×617, cos ×418, atan2 ×102, hypot ×349, pow ×41, exp ×3, Math.random ×142, performance.now ×62, Date.now ×10, `.sort(` ×22. Rollback netcode in the old game works only same-engine; Proto3 needs `sim.math` and seeded RNG, so "identical" means tolerance-level, tested by scenarios.
3. **Float drift vs parity**: replacing Math.* with deterministic math changes results at ~1e-12; parity harness must compare with tolerance and short scenarios.
4. **Embedded data**: SFX as base64 in script, 1 png + 1 webp base64 — extract to assets.
5. **UI/sim entanglement**: drawing and menus read globals (`mode`, `T`, `CX`) directly.
6. **Hidden worker**: sf-turn Worker source lives only in Cloudflare dashboard.
7. **External deps**: PeerJS public server, Cloudflare TURN, YouTube IFrame API, Metered fallback.

## Netcode as found (copy as defaults)
Inputs-only rollback, 2–32 players, host relays. Input delay `D=2`, rollback window `NMAXP=10`, checksum every `NSUMEV=60` frames (full + detailed per-section diff), stall when remote confirmation lags > NMAXP+D, frame-skip when ahead, `drop` frames for leavers, `CX.mer` = extra step per frame, Worker timer (8 ms) drives ticks in hidden tabs, SFX muted during re-simulation, camera/shake preserved across rollback, protocol hash `NETV` from script content.

## Still to audit (before Phase 2 sign-off)
Character move internals (table at script lines ~4376–4630), per-item `GIVE` implementations (cards: `updItem` spawn every `ITEM_EVERY`, capture by standing on card, Last Word every `ULT_EVERY`), CPU decision details, lobby/online screen code. sf-turn worker: DONE (`legacy/workers/turn-worker.js`).
