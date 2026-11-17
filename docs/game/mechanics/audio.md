# Audio (sound effects)
## Rule
Every game action plays the legacy sound with the legacy volume and playback rate: `sfx(name, vol, rate)` x per-sound gain `SFXG` x `T.VOL` (0.8) x mixer (`VOLS.sfx * VOLS.master`) x `ENDK`. One sound name plays at most once per 45 ms (legacy "1 action = 1 sound"). While time is stopped the dry signal is halved and sent through a 2.6 s seeded-noise reverb. The heavy-charge sound is keyed per player and cut when the charge is released early. `ENDK`: when exactly two survivors remain, both on their last stock, every sound swells up to +5 % as the weaker one nears 0 HP (lerp 0.02 / frame).
Damage sound `damage00`: volume 0.3 -> 1.3 and rate +10 % with missing HP, once per 3 frames; heavy-bullet hits only play it when the bullet's hit data has a speed (`m.spd`): pattern danmaku (`SPH`), `xBall` customs and the rifle are silent.
## Legacy
`function sfx(`, `revNode`, `const SFXG=`, `const ALIAS=`, `const SCD={}` (cooldown wrapper), `const sfxDmg=`, `ENDK+=`, `const SV=`; sounds are base64 in `SFX_B64`.
## Port
- Sites: sim code calls `sfx`/`sfxR`/`sfxDmg` from `packs/combat/jfx.ts` (a presentation command, never read by the sim); juice handlers in `packs/render/juice/events.ts` turn events and commands into `Juice.SND` entries (`snd`, rate limiters `j.sl`, `endK`).
- Player: `packs/audio/player.ts` (`initAudio` unlocks the AudioContext on the first gesture and preloads; `playSounds` drains one batch after each render in `src/main.ts`).
- Files: `tools/audio/extract.ts` writes `public/sfx/*.ogg` + `packs/audio/sfx-list.ts` (`SFX_FILES`, `SFXG`, `ALIAS`) from the legacy file — the owner's own sounds, no generated assets.
- Bullet flag `BF.mute` (`packs/combat/state.ts`) = legacy hit data without `spd`.
## Tests
`pnpm render compare <a,b> 1500` prints SOUNDS: per frame the sorted `name|vol|rate` lists of legacy vs port with the legacy call sites (`SNDF=a-b` dumps a frame window). Ledger entry `audio-sfx`.
## Bugs
- Extra `damage00` on spell danmaku / custom heavy hits -> port passed `spd: 1` for every heavy bullet -> `BF.mute`.
- Missing `se_enep00` when the rifle pierced a heavy bullet -> pierce branch skipped legacy `brk()`.
- Killing Doll `slice` one frame early / lost after the spell -> it belongs to the first doll's own turn (`BK.dollH`, `p0` marks it), not the volley clock.

# Music
## Rule
Each screen has a playlist: built-in tracks (menu, combat, training, results, last = 1v1 last stock) + the player's own files added in Options > Sound > Music (weight 1-20 each). A random track by weight (never the same twice in a row), fade-in, next track at the end; on each KO the music slows by 32 % and dips 45 % for ~2 s; paused while time is stopped; volume = music x master x ENDK.
## Legacy
`const BMUS=`, `function musPick`, `function musPlay`, `function musTick`, `const musScr=`, `function addMusic`, IndexedDB `sf_music`.
## Port
`packs/audio/music.ts` (`initMusic`, `musTick`, `musKO`, `addMusic`, `setWeight`, `removeMusic`), tracks in `public/music/` (copied from the proto2 repo: the owner's files); screen choice + KO detection (juice `koN`) in `src/main.ts`; track rows in the Sound menu through `UiHost.tracks`.
## Not ported
Map music (map maker, lot 4), ducking item (CX.don, themed items), YouTube player.
