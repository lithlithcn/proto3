# Themed items: port plan

## How legacy wires them (read before porting any themed item)
Themed items do not live in one place: each one adds a branch to SHARED legacy functions, in a fixed order, and they share the sim rng.
- `GIVE.<key>` (line ~877 for TH6-9, then `Object.assign(GIVE,…)` per section): what the card does when taken.
- `chPre(); chPre2(); … chPre5();` inside `updWorld` (line ~3283, after KO beams / GFX, before clouds / slashes / verdicts / `updEnt`): per-frame logic. `chPre` also holds the status countdown (`for k in p.fx`, PERMFX = gung/kline/judge never tick) and `fxEnd`.
- `chHit` (hit guard, line ~929), `chDmg` (damage factors after the parry streak, line ~937), `chBullet` (bullet-hit guard, ~946), `chMelee` (attack override, ~956), `chSpeed` (speed factor, ~928), `chKill` / `chEnd` (KO and global-effect end hooks, ~992-996).
- Global effects: `CX.<name>` objects with a timer `t` (ticked in chPre line ~998), `GFX` list (global visual + rule effects), `ENT` entity kinds (`EST` logic, `EDR` draws), `CLOUDS`, `SLASH`, `JUDG`.
- Draws: `chDraw(); … chDraw5();` in drawWorldItems (already verbatim in `packs/render/ld/themed.ts`, stubs until the state exists) + `drawP` additions + HUD status names (`FXN`).
## Port architecture (decided 2026-11-17)
- One `rules` content entry in the touhou pack = the themed rule set, functions called by combat at the legacy points: `pre` (the chPre..chPre5 bodies in legacy order, called from `updateItemWorld` at the line-3283 position), `hit`, `dmg`, `bullet`, `melee`, `speed`, `kill`, `fxEnd`. Bodies stay in legacy order inside each function so the shared rng draws match.
- Per-player item fields and CX globals = typed columns in the touhou slice (one block per item, named after the legacy field).
- Status slots: append to `FXS` (never renumber), PERMFX = `perm`.
- Every item: content file `packs/touhou/items/<key>.ts` (legacy key, `order` = legacy index), sheet `docs/game/items/<key>.md`, parity scenario in `tests/parity/themed-*.test.ts` (give at frame 60, compare every frame, probe the effect happened).
- Item entities (legacy ENT kinds handled in `updEnt`): kind ids 300+ declared in `packs/themed`, logic in `RulesDef.ent` (called per entity by `updateEnts` after its timer ticks), render name in `packs/render/ld/bind.ts` EKN, oracle mapping in `tools/parity/legacy.cjs` (`E:` themed map). Shared fire helpers (`hb`/`fb`/`ring`/`xR`/`xOnR`): `packs/themed/fire.ts`.
- Per item, besides the sim scenario: render check `PLAN=<key>@100/0 pnpm render compare reimu,marisa 450` (drawActs/drawWorldItems/drawHeavy/sounds/juice identical) and add the key to `RITEMS` in `tools/gate.ts` (run by `pnpm gate --items`). CX globals reach the copied draws through `packs/render/ld/cx.ts`; per-player themed columns through `thOf`.
- Ported so far: rumia, daiyousei, rin, meiling, koakuma. Elements (tags/auras, no reactions): `docs/game/mechanics/elements.md`.
- Per-player themed columns are compared automatically by the parity harness against the legacy field of the same name (legacy `undefined` = 0, or `THEMED_UNSET`).
- Port in legacy section order: TH6-9 (lines 877-1155), TH10-12 + Reimu (1156), TH13-16 + Yukari (1339), TH17-20 (1574), lots 1-4 (2518-2830).

## Inventory (generated from the legacy file)

One row per legacy item not ported yet (legacy ITEMS order). `line` = where its GIVE entry starts; `state` = fx./CX. keys it sets; `ents` = entity kinds it spawns; `refs` = how many places in the legacy file read those keys (rough size of the port).

| # | key | name | character | line | state | ents | refs |
|---|---|---|---|---|---|---|---|
| 10 | reimu | Fantasy Sky | Reimu Hakurei | 1181 | rei |  | 3 |
| 16 | patchouli | Philosopher Stone | Patchouli Knowledge | 882 | terr |  | 18 |
| 17 | remilia | Spear the Gungnir | Remilia Scarlet | 883 | gung |  | 3 |
| 18 | flandre | Four of a Kind | Flandre Scarlet | 884 | four |  | 5 |
| 21 | letty | Eternal Winter | Letty Whiterock | 885 | winter |  | 2 |
| 22 | chen | Pinball Cat | Chen | 886 | spin |  | 5 |
| 23 | shanghai | Body Swap | Shanghai Doll | 888 | swap |  | 12 |
| 24 | hourai | Cursed Link | Hourai Doll | 889 | link | voodoo | 6 |
| 25 | lily | Spring Is Here | Lily White | 890 | spring |  | 6 |
| 26 | lunasa | Tempo Lento | Lunasa Prismriver | 891 | lun notes |  | 7 |
| 27 | merlin | Mania | Merlin Prismriver | 892 | mer notes |  | 11 |
| 28 | lyrica | Phantom Sounds | Lyrica Prismriver | 893 | lyr notes |  | 9 |
| 29 | layla | Final Concert | Layla Prismriver | 894 | rhy |  | 9 |
| 30 | youmu | Half-Phantom Slash | Youmu Konpaku | 895 | yslash |  | 2 |
| 31 | ran | Ultimate Shikigami | Ran Yakumo | 887 | ran spin |  | 8 |
| 32 | yuyuko | Invitation to Death | Yuyuko Saigyouji | 896 | yuyu |  | 5 |
| 33 | saigyou | Kill or Die | Saigyou Ayakashi | 897 |  | tree | 0 |
| 34 | yukari | Boundary of Everything | Yukari Yakumo | 1380 | yuka |  | 3 |
| 36 | wriggle | Metamorphosis | Wriggle Nightbug | 898 |  |  | 0 |
| 37 | mystia | Night Sparrow | Mystia Lorelei | 899 | myst |  | 6 |
| 38 | keine | History Rewritten | Keine Kamishirasawa | 2262 | kei |  | 6 |
| 39 | tewi | Rule Roulette | Tewi Inaba | 901 | rule |  | 16 |
| 40 | reisen | Lunatic Red Eyes | Reisen Udongein Inaba | 902 | reis |  | 3 |
| 41 | eirin | Pharmacy | Eirin Yagokoro | 903 | pill |  | 7 |
| 42 | kaguya | Five Impossible Requests | Kaguya Houraisan | 904 | kline | treasure | 1 |
| 43 | mokou | Immortal Kamikaze | Fujiwara no Mokou | 905 | phoenix |  | 13 |
| 45 | medicine | Poison Trail | Medicine Melancholy | 906 | smoke |  | 1 |
| 46 | komachi | Distance: Zero | Komachi Onozuka | 907 | shr |  | 7 |
| 47 | eiki | Verdict | Eiki Shiki | 908 | judge |  | 1 |
| 48 | shizuha | Fallen Leaves | Shizuha Aki | 1158 | leaf |  | 5 |
| 49 | minoriko | Great Harvest | Minoriko Aki | 1159 | harv |  | 2 |
| 50 | hina | Vortex of Misfortune | Hina Kagiyama | 1160 | hina |  | 1 |
| 51 | nitori | Kappa Mech | Nitori Kawashiro | 1161 | mech |  | 4 |
| 52 | momiji | Mountain Guard | Momiji Inubashiri | 1162 | guard |  | 4 |
| 53 | sanae | Wind of Fortune | Sanae Kochiya | 1163 |  |  | 0 |
| 54 | kanako | Onbashira Rain | Kanako Yasaka | 1164 | onb |  | 5 |
| 55 | suwako | Underground Frog | Suwako Moriya | 1165 | under |  | 9 |
| 58 | yamame | Spider Webs | Yamame Kurodani | 1166 |  |  | 0 |
| 59 | parsee | Green-Eyed Jealousy | Parsee Mizuhashi | 1168 | jeal |  | 1 |
| 60 | yuugi | Oni Throw | Yuugi Hoshiguma | 1169 | oni |  | 1 |
| 61 | satori | Mind Reading | Satori Komeiji | 1170 | sat |  | 3 |
| 62 | orin | Fires of Hell | Rin Kaenbyou | 1171 | hell |  | 11 |
| 63 | okuu | Nuclear Fusion | Utsuho Reiuji | 1172 | sun |  | 5 |
| 64 | koishi | Unconscious | Koishi Komeiji | 1173 | invis koishi |  | 14 |
| 65 | nazrin | Dowsing | Nazrin | 1174 | dowse |  | 3 |
| 66 | kogasa | Surprise Shower | Kogasa Tatara | 1175 | rain |  | 10 |
| 67 | ichirin | Unzan Fists | Ichirin Kumoi | 1176 | unzan |  | 2 |
| 68 | minamitsu | Shipwreck | Minamitsu Murasa | 1177 | flood |  | 15 |
| 69 | shou | Inner Light | Shou Toramaru | 1178 | shou |  | 2 |
| 70 | byakuren | Ancient Scroll | Byakuren Hijiri | 1179 | sutra |  | 1 |
| 71 | nue | Undefined Flying Objects | Nue Houjuu | 1180 | nue | ufo | 3 |
| 72 | kyouko | Mountain Echo | Kyouko Kasodani | 1351 | echoB |  | 2 |
| 73 | yoshika | Jiang-shi | Yoshika Miyako | 1352 | jiang |  | 3 |
| 74 | seiga | Necromancy | Seiga Kaku | 1353 |  | zombie | 0 |
| 75 | tojiko | Chain Thunder | Soga no Tojiko | 1354 | storm |  | 7 |
| 76 | futo | Feng Shui Plates | Mononobe no Futo | 1355 | futo |  | 1 |
| 77 | miko | Imperial Orders | Toyosatomimi no Miko | 1356 | order |  | 8 |
| 78 | wakasagi | Puddle Network | Wakasagihime | 1358 | mermaid | puddle | 1 |
| 79 | sekibanki | Nine Heads | Sekibanki | 1359 | heads | head | 3 |
| 80 | kagerou | Full Moon | Kagerou Imaizumi | 1360 | wolf |  | 3 |
| 81 | benben | Resonance | Benben Tsukumo | 1361 | reso |  | 1 |
| 82 | yatsuhashi | Glissando | Yatsuhashi Tsukumo | 1362 | koto |  | 7 |
| 83 | seija | Reverse Ideology | Seija Kijin | 1363 | flip |  | 6 |
| 84 | shinmyou | Wonder Mallet | Shinmyoumaru Sukuna | 1364 | mallet |  | 3 |
| 85 | raiko | War Drum | Raiko Horikawa | 1365 |  |  | 0 |
| 86 | seiran | Mochie Mania | Seiran | 1366 | mochi |  | 6 |
| 87 | ringo | Dango Feast | Ringo | 1367 | dangoT |  | 2 |
| 88 | doremy | Dreams & Nightmares | Doremy Sweet | 1368 | dreamE | dream | 2 |
| 89 | sagume | Tongue of Reversal | Sagume Kishin | 1369 | proph |  | 19 |
| 90 | clown | Moonfall | Clownpiece | 1370 | moon |  | 5 |
| 91 | junko | Pure Purification | Junko | 1371 | pure |  | 5 |
| 92 | hecatia | Three Worlds | Hecatia Lapislazuli | 1372 | planets |  | 1 |
| 93 | larva | Chrysalis | Eternity Larva | 1373 | larva |  | 2 |
| 94 | nemuno | Territory | Nemuno Sakata | 1374 |  | terr | 0 |
| 95 | aunn | Komainu Guard | Aunn Komano | 1375 |  | dog | 0 |
| 96 | narumi | Living Statue | Narumi Yatadera | 1376 | armor |  | 3 |
| 97 | satono | Forced Dance | Satono Nishida | 1377 | dance |  | 5 |
| 98 | mai | Bamboo Choreography | Mai Teireida | 1378 |  | bamb | 0 |
| 99 | okina | Secret Back Doors | Okina Matara | 1379 |  | mirr | 0 |
| 100 | eika | Stone Tower | Eika Ebisu | 1578 | stack |  | 6 |
| 101 | urumi | Crushing Weight | Urumi Ushizaki | 1579 | wz wzone |  | 9 |
| 102 | kutaka | Chicken Swarm | Kutaka Niwatari | 1580 |  | chick | 0 |
| 103 | yachie | Contract | Yachie Kicchou | 1581 |  |  | 0 |
| 104 | mayumi | Haniwa Army | Mayumi Joutouguu | 1582 |  | haniwa | 0 |
| 105 | keiki | Sculpt the Arena | Keiki Haniyasushin | 1583 | sculpt |  | 1 |
| 106 | saki | Full Gallop | Saki Kurokoma | 1584 | gallop |  | 3 |
| 107 | yuuma | Devour Everything | Yuuma Toutetsu | 1585 | devour |  | 3 |
| 108 | mike | Coin Rain | Mike Goutokuji | 1586 | coins |  | 4 |
| 109 | takane | Forest Qi | Takane Yamashiro | 1587 |  | qtree | 0 |
| 110 | sannyo | Hypnotic Smoke | Sannyo Komakusa | 1588 |  | smoke | 0 |
| 111 | misumaru | Magatama Jewels | Misumaru Tamatsukuri | 1589 |  | jewel | 0 |
| 112 | tsukasa | Whispers | Tsukasa Kudamaki | 1590 | whisper |  | 2 |
| 113 | megumu | Starry Constellation | Megumu Iizunamaru | 1591 | const6 |  | 2 |
| 114 | chimata | Ownerless Market | Chimata Tenkyuu | 1592 | owner | book | 5 |
| 115 | momoyo | Dragon Eater | Momoyo Himemushi | 1593 |  | dragon | 0 |
| 116 | biten | Ruyi Staff | Son Biten | 1594 | staff |  | 3 |
| 117 | enoko | The Hunt | Enoko Mitsugashira | 1595 |  | hound trap | 0 |
| 118 | chiyari | Bloodthirst | Chiyari Tenkajin | 1596 | blood |  | 3 |
| 119 | hisami | Eternal Pursuit | Hisami Yomotsu | 1597 | chain |  | 1 |
| 120 | zanmu | Nothingness | Zanmu Nippaku | 1598 | void |  | 10 |
| 121 | ubame | The Mountain Tilts | Ubame Chirizuka | 1599 | tilt |  | 4 |
| 122 | chimi | Mountain Spirits | Chimi Houjuu | 1600 | mtn |  | 6 |
| 123 | nareko | One Way Only | Nareko Michigami | 1601 |  |  | 0 |
| 124 | yuiman | Serpent's Rebirth | Yuiman Asama | 1602 | serp |  | 2 |
| 125 | toyohime | Lunar Fan | Watatsuki no Toyohime | 1603 |  |  | 0 |
| 126 | ariya | Stone Gaze | Ariya Iwanaga | 1606 | gaze2 |  | 4 |
| 127 | nina | Mirage | Nina Watari | 1607 | mirF mirage |  | 11 |
| 128 | saisen | Donation Box | Reimu Hakurei | 0 |  |  | 0 |
| 129 | mamizou | Tanuki Transformation | Mamizou Futatsuiwa | 1357 | leaf |  | 5 |
| 130 | rainbow | Last Word |  | 0 |  |  | 0 |
